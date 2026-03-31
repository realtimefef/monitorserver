package com.monitorserver.service;

import com.monitorserver.dto.request.CreateReportRequest;
import com.monitorserver.dto.response.ScheduledReportResponse;
import com.monitorserver.entity.*;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.MetricRepository;
import com.monitorserver.repository.ScheduledReportRepository;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ScheduledReportService {

    private final ScheduledReportRepository repository;
    private final ServerRepository serverRepository;
    private final MetricRepository metricRepository;
    private final EmailService emailService;

    /**
     * Get all scheduled reports owned by a user.
     */
    @Transactional(readOnly = true)
    public List<ScheduledReportResponse> getAll(Long userId) {
        return repository.findByOwnerId(userId).stream()
                .map(ScheduledReportResponse::from)
                .toList();
    }

    /**
     * Create a new scheduled report.
     * Validates that the report name is provided, builds the entity,
     * converts metric type strings to the enum set, and saves.
     */
    @Transactional
    public ScheduledReportResponse create(CreateReportRequest request, User owner) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Report name is required");
        }

        ScheduledReport report = ScheduledReport.builder()
                .owner(owner)
                .name(request.getName())
                .format(request.getFormat() != null
                        ? ReportFormat.valueOf(request.getFormat())
                        : ReportFormat.PDF)
                .timeframe(request.getTimeframe())
                .frequency(request.getFrequency() != null
                        ? request.getFrequency()
                        : "MANUAL")
                .recipients(request.getRecipients())
                .enabled(request.getEnabled() != null
                        ? request.getEnabled()
                        : false)
                .serverIds(request.getServerIds() != null
                        ? new HashSet<>(request.getServerIds())
                        : new HashSet<>())
                .build();

        // Convert metric type strings to enum set
        if (request.getMetricTypes() != null && !request.getMetricTypes().isEmpty()) {
            Set<MetricType> types = request.getMetricTypes().stream()
                    .map(MetricType::valueOf)
                    .collect(Collectors.toSet());
            report.setMetricTypes(types);
        }

        // Calculate next run time if enabled and has a frequency
        if (report.isEnabled() && report.getFrequency() != null && !"MANUAL".equalsIgnoreCase(report.getFrequency())) {
            report.setNextRunAt(calculateNextRun(report.getFrequency()));
        }

        report = repository.save(report);

        log.info("Scheduled report '{}' created by user {}", report.getName(), owner.getId());

        return ScheduledReportResponse.from(report);
    }

    /**
     * Update an existing scheduled report. Verifies ownership.
     * Only updates fields that are non-null in the request.
     */
    @Transactional
    public ScheduledReportResponse update(Long id, CreateReportRequest request, Long userId) {
        ScheduledReport report = repository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduledReport", id));

        if (request.getName() != null) {
            report.setName(request.getName());
        }
        if (request.getFormat() != null) {
            report.setFormat(ReportFormat.valueOf(request.getFormat()));
        }
        if (request.getTimeframe() != null) {
            report.setTimeframe(request.getTimeframe());
        }
        if (request.getFrequency() != null) {
            report.setFrequency(request.getFrequency());
        }
        if (request.getRecipients() != null) {
            report.setRecipients(request.getRecipients());
        }
        if (request.getEnabled() != null) {
            report.setEnabled(request.getEnabled());
        }
        if (request.getServerIds() != null) {
            report.setServerIds(new HashSet<>(request.getServerIds()));
        }
        if (request.getMetricTypes() != null) {
            Set<MetricType> types = request.getMetricTypes().stream()
                    .map(MetricType::valueOf)
                    .collect(Collectors.toSet());
            report.setMetricTypes(types);
        }

        // Recalculate next run if enabled and has a non-manual frequency
        if (report.isEnabled() && report.getFrequency() != null && !"MANUAL".equalsIgnoreCase(report.getFrequency())) {
            if (report.getNextRunAt() == null || report.getNextRunAt().isBefore(LocalDateTime.now())) {
                report.setNextRunAt(calculateNextRun(report.getFrequency()));
            }
        } else {
            report.setNextRunAt(null);
        }

        report = repository.save(report);

        log.info("Scheduled report {} updated by user {}", id, userId);

        return ScheduledReportResponse.from(report);
    }

    /**
     * Delete a scheduled report. Verifies ownership.
     */
    @Transactional
    public void delete(Long id, Long userId) {
        ScheduledReport report = repository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduledReport", id));

        repository.delete(report);

        log.info("Scheduled report {} deleted by user {}", id, userId);
    }

    /**
     * Scheduled job that runs every 60 seconds to process auto-reports
     * whose nextRunAt has passed.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processAutoReports() {
        List<ScheduledReport> dueReports = repository.findByEnabledTrueAndNextRunAtBefore(LocalDateTime.now());

        if (dueReports.isEmpty()) return;

        log.info("Processing {} due scheduled reports", dueReports.size());

        for (ScheduledReport report : dueReports) {
            try {
                sendReportEmail(report);
                report.setLastGeneratedAt(LocalDateTime.now());
                report.setNextRunAt(calculateNextRun(report.getFrequency()));
                repository.save(report);
                log.info("Scheduled report '{}' (id={}) sent successfully", report.getName(), report.getId());
            } catch (Exception e) {
                log.error("Failed to process scheduled report '{}' (id={}): {}",
                        report.getName(), report.getId(), e.getMessage());
            }
        }
    }

    /**
     * Build HTML report content and send via email to the report's recipients.
     */
    private void sendReportEmail(ScheduledReport report) {
        if (report.getRecipients() == null || report.getRecipients().isBlank()) {
            log.warn("Report '{}' has no recipients, skipping", report.getName());
            return;
        }
        if (report.getOwner() == null || report.getOwner().getId() == null) {
            log.error("Report '{}' has null owner, skipping", report.getName());
            return;
        }

        List<String> recipientList = splitAndValidateRecipients(report.getRecipients());
        if (recipientList.isEmpty()) {
            log.warn("Report '{}' has no valid recipients, skipping", report.getName());
            return;
        }

        String[] recipients = recipientList.toArray(new String[0]);
        String timeframe = report.getTimeframe() != null ? report.getTimeframe() : "24h";
        LocalDateTime since = parseSince(timeframe);

        StringBuilder html = new StringBuilder();
        html.append("<p style='font-size:14px;color:#374151;margin-bottom:16px;'>Report generated on <strong>")
            .append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")))
            .append("</strong> | Timeframe: <strong>").append(HtmlUtils.htmlEscape(timeframe)).append("</strong></p>");

        html.append("<table style='width:100%;border-collapse:collapse;font-size:13px;'>");
        html.append("<tr style='background:#f3f4f6;'>");
        html.append("<th style='padding:8px 12px;text-align:left;border:1px solid #e5e7eb;'>Server</th>");
        html.append("<th style='padding:8px 12px;text-align:left;border:1px solid #e5e7eb;'>Metric</th>");
        html.append("<th style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>Latest</th>");
        html.append("<th style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>Avg</th>");
        html.append("<th style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>Max</th>");
        html.append("<th style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>Min</th>");
        html.append("<th style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>Points</th>");
        html.append("</tr>");

        Set<Long> serverIds = report.getServerIds();
        Set<MetricType> metricTypes = report.getMetricTypes();

        if (serverIds == null || serverIds.isEmpty()) {
            // Use all servers belonging to the report owner
            serverIds = serverRepository.findByOwnerId(report.getOwner().getId())
                    .stream()
                    .map(MonitoredServer::getId)
                    .collect(Collectors.toSet());
        }

        int totalRows = 0;
        for (Long serverId : serverIds) {
            Optional<MonitoredServer> serverOpt = serverRepository.findById(serverId);
            if (serverOpt.isEmpty()) continue;
            MonitoredServer server = serverOpt.get();

            Set<MetricType> types = (metricTypes != null && !metricTypes.isEmpty())
                    ? metricTypes
                    : Set.of(MetricType.values());

            for (MetricType type : types) {
                List<Metric> metrics = metricRepository.findByServerIdAndMetricTypeAndTimestampBetweenOrderByTimestampAsc(
                        serverId, type, since, LocalDateTime.now());

                if (metrics == null || metrics.isEmpty()) continue;

                double latestVal = metrics.get(metrics.size() - 1).getValue();
                double avg = metrics.stream().mapToDouble(Metric::getValue).average().orElse(0.0);
                double max = metrics.stream().mapToDouble(Metric::getValue).max().orElse(0.0);
                double min = metrics.stream().mapToDouble(Metric::getValue).min().orElse(0.0);

                html.append("<tr>");
                html.append("<td style='padding:8px 12px;border:1px solid #e5e7eb;'>")
                    .append(HtmlUtils.htmlEscape(server.getName())).append("</td>");
                html.append("<td style='padding:8px 12px;border:1px solid #e5e7eb;'>")
                    .append(type.name()).append("</td>");
                html.append("<td style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>")
                    .append(String.format("%.2f", latestVal)).append("</td>");
                html.append("<td style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>")
                    .append(String.format("%.2f", avg)).append("</td>");
                html.append("<td style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>")
                    .append(String.format("%.2f", max)).append("</td>");
                html.append("<td style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>")
                    .append(String.format("%.2f", min)).append("</td>");
                html.append("<td style='padding:8px 12px;text-align:right;border:1px solid #e5e7eb;'>")
                    .append(metrics.size()).append("</td>");
                html.append("</tr>");
                totalRows++;
            }
        }

        html.append("</table>");
        if (totalRows == 0) {
            html.append("<p style='font-size:13px;color:#6b7280;margin-top:12px;'>No metric data was available for the selected servers and metrics in this timeframe.</p>");
        }
        html.append("<p style='font-size:12px;color:#9ca3af;margin-top:16px;'>This is an automated report from Monitor Server.</p>");

        emailService.sendInfrastructureReportEmail(recipients, report.getName(), html.toString());
    }

    /**
     * Calculate the next run time based on frequency string.
     */
    private LocalDateTime calculateNextRun(String frequency) {
        if (frequency == null) return null;
        return switch (frequency.toUpperCase()) {
            case "HOURLY" -> LocalDateTime.now().plusHours(1);
            case "DAILY" -> LocalDateTime.now().plusDays(1);
            case "WEEKLY" -> LocalDateTime.now().plusWeeks(1);
            case "MONTHLY" -> LocalDateTime.now().plusMonths(1);
            default -> null;
        };
    }

    /**
     * Parse a timeframe string (e.g. "24h", "7d", "30d") into a "since" timestamp.
     */
    private LocalDateTime parseSince(String timeframe) {
        if (timeframe == null) return LocalDateTime.now().minusDays(1);
        String tf = timeframe.trim().toLowerCase();
        try {
            if (tf.endsWith("h")) {
                return LocalDateTime.now().minusHours(Long.parseLong(tf.replace("h", "")));
            } else if (tf.endsWith("d")) {
                return LocalDateTime.now().minusDays(Long.parseLong(tf.replace("d", "")));
            }
        } catch (NumberFormatException e) {
            log.warn("Invalid timeframe '{}', defaulting to 24h", timeframe);
        }
        return LocalDateTime.now().minusDays(1);
    }

    /**
     * Split recipients string and validate each is a valid email address.
     */
    private List<String> splitAndValidateRecipients(String recipients) {
        if (recipients == null || recipients.isBlank()) return List.of();
        String[] rawEmails = recipients.split("[,;\\s]+");
        List<String> valid = new ArrayList<>();
        for (String raw : rawEmails) {
            String email = raw.trim();
            if (email.isEmpty()) continue;
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                log.warn("Invalid email recipient skipped: {}", email);
                continue;
            }
            valid.add(email);
        }
        return valid;
    }
}
