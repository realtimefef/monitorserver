package com.monitorserver.service;

import com.monitorserver.dto.response.AlertResponse;
import com.monitorserver.entity.*;
import com.monitorserver.repository.AlertRepository;
import com.monitorserver.repository.AlertRuleRepository;
import com.monitorserver.repository.MetricRepository;
import com.monitorserver.repository.UserNotificationPreferenceRepository;
import com.monitorserver.repository.UserUsageStatsRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class AlertEvaluationService {

    private final AlertRuleRepository alertRuleRepository;
    private final AlertRepository alertRepository;
    private final AlertService alertService;
    private final MetricRepository metricRepository;
    private final WebSocketNotificationService wsNotificationService;
    private final EmailService emailService;
    private final EmailRateLimiter emailRateLimiter;
    private final UserNotificationPreferenceRepository notifPrefRepo;
    private final UserUsageStatsRepository userUsageStatsRepository;
    private final MaintenanceWindowService maintenanceWindowService;
    private final WebhookDeliveryService webhookDeliveryService;

    public AlertEvaluationService(
            AlertRuleRepository alertRuleRepository,
            AlertRepository alertRepository,
            AlertService alertService,
            MetricRepository metricRepository,
            WebSocketNotificationService wsNotificationService,
            @Lazy EmailService emailService,
            EmailRateLimiter emailRateLimiter,
            UserNotificationPreferenceRepository notifPrefRepo,
            UserUsageStatsRepository userUsageStatsRepository,
            MaintenanceWindowService maintenanceWindowService,
            WebhookDeliveryService webhookDeliveryService) {
        this.alertRuleRepository = alertRuleRepository;
        this.alertRepository = alertRepository;
        this.alertService = alertService;
        this.metricRepository = metricRepository;
        this.wsNotificationService = wsNotificationService;
        this.emailService = emailService;
        this.emailRateLimiter = emailRateLimiter;
        this.notifPrefRepo = notifPrefRepo;
        this.userUsageStatsRepository = userUsageStatsRepository;
        this.maintenanceWindowService = maintenanceWindowService;
        this.webhookDeliveryService = webhookDeliveryService;
    }

    /**
     * Evaluate all enabled alert rules for a server against an incoming metric.
     * For each matching rule whose condition is met, checks cooldown and fires
     * the alert if appropriate. Also broadcasts via WebSocket and sends
     * email notifications if the user's preferences allow.
     * When the condition is no longer met, auto-resolves any active alert for that rule.
     */
    @Transactional
    public void evaluate(Metric metric, MonitoredServer server) {
        // Skip alert evaluation if server is in a maintenance window
        if (maintenanceWindowService.isInMaintenance(server.getId())) {
            log.debug("Server '{}' is in maintenance window, skipping alert evaluation", server.getName());
            return;
        }

        List<AlertRule> rules = alertRuleRepository.findByServerIdAndMetricTypeAndIsEnabledTrue(
                server.getId(), metric.getMetricType());

        for (AlertRule rule : rules) {
            boolean triggered = evaluateCondition(
                    metric.getValue(), rule.getThresholdValue(), rule.getConditionOperator());

            if (triggered) {
                // Check if there's already an active/acknowledged alert for this rule
                Optional<Alert> existingAlert = alertRepository.findTopByAlertRuleIdAndStatusIn(
                        rule.getId(), List.of(AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED));

                if (existingAlert.isPresent()) {
                    // Update the existing alert with the latest metric value
                    updateOpenAlert(existingAlert.get(), metric.getValue());
                    continue;
                }

                // Check durationSeconds: if set, verify condition sustained over the window
                if (rule.getDurationSeconds() != null && rule.getDurationSeconds() > 0) {
                    if (!isConditionSustained(server.getId(), rule)) {
                        log.debug("Alert rule '{}' condition not sustained for {}s, skipping",
                                rule.getName(), rule.getDurationSeconds());
                        continue;
                    }
                }

                // Check cooldown: skip if a recent active alert exists for this rule
                LocalDateTime cooldownSince = LocalDateTime.now().minusMinutes(rule.getCooldownMinutes());

                Optional<Alert> recentActive = alertRepository.findByAlertRuleIdAndStatusAndTriggeredAtAfter(
                        rule.getId(), AlertStatus.ACTIVE, cooldownSince);

                if (recentActive.isPresent()) {
                    log.debug("Alert rule '{}' is in cooldown (active alert exists), skipping", rule.getName());
                    continue;
                }

                // Also check if there is a recent acknowledged alert in cooldown
                Optional<Alert> recentAcknowledged = alertRepository.findByAlertRuleIdAndStatusAndTriggeredAtAfter(
                        rule.getId(), AlertStatus.ACKNOWLEDGED, cooldownSince);

                if (recentAcknowledged.isPresent()) {
                    log.debug("Alert rule '{}' has recent acknowledged alert, skipping", rule.getName());
                    continue;
                }

                // Create the alert
                Alert alert = alertService.createAlert(server, rule, metric.getValue());
                AlertResponse alertResponse = AlertResponse.from(alert);

                // Update server status based on alert severity
                updateServerStatus(server, rule.getSeverity());

                // Broadcast via WebSocket to the server owner
                Long userId = server.getOwner().getId();
                wsNotificationService.broadcastAlertUpdate(userId, alertResponse);

                // Send email notification if user preferences allow
                sendEmailNotificationIfEnabled(server.getOwner(), alert);

                // Send webhook notifications
                webhookDeliveryService.sendAlertWebhooks(server.getOwner(), alert);

                // Update user usage stats — increment alerts triggered
                try {
                    userUsageStatsRepository.findByUserId(userId).ifPresent(stats -> {
                        stats.setTotalAlertsTriggered(stats.getTotalAlertsTriggered() + 1);
                        userUsageStatsRepository.save(stats);
                    });
                } catch (Exception e) {
                    log.warn("Failed to update user usage stats for alerts: {}", e.getMessage());
                }

                log.info("Alert fired for rule '{}' on server '{}': value={}, threshold={}",
                        rule.getName(), server.getName(), metric.getValue(), rule.getThresholdValue());
            } else {
                // Condition no longer met — auto-resolve any active alert for this rule
                autoResolveAlert(rule);
            }
        }
    }

    /**
     * Auto-resolve the latest ACTIVE or ACKNOWLEDGED alert for a rule
     * when the metric condition is no longer met.
     */
    private void autoResolveAlert(AlertRule rule) {
        Optional<Alert> openAlert = alertRepository.findTopByAlertRuleIdAndStatusIn(
                rule.getId(), List.of(AlertStatus.ACTIVE, AlertStatus.ACKNOWLEDGED));

        openAlert.ifPresent(alert -> {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setNote("Auto-resolved: condition no longer met");
            alertRepository.save(alert);

            log.info("Auto-resolved alert {} for rule '{}' on server '{}'",
                    alert.getId(), rule.getName(), alert.getServer().getName());

            // Recalculate server status based on remaining open alerts
            updateServerStatusAfterAlertChange(alert.getServer());

            // Broadcast resolution via WebSocket
            Long userId = alert.getServer().getOwner().getId();
            wsNotificationService.broadcastAlertUpdate(userId, AlertResponse.from(alert));
        });
    }

    /**
     * Update an existing open alert with the latest metric value
     * instead of creating a duplicate. Also updates server status based on severity.
     */
    private void updateOpenAlert(Alert alert, Double latestValue) {
        alert.setMetricValue(latestValue);
        alert.setMessage(String.format("%s %s %.2f (current: %.2f) on %s",
                alert.getAlertRule().getMetricType().name(),
                alert.getAlertRule().getConditionOperator().name().toLowerCase().replace('_', ' '),
                alert.getThresholdValue(),
                latestValue,
                alert.getServer().getName()));
        alertRepository.save(alert);

        // Update server status based on alert severity
        updateServerStatus(alert.getServer(), alert.getSeverity());

        log.debug("Updated open alert {} with latest value {}", alert.getId(), latestValue);
    }

    /**
     * Update server status based on alert severity.
     * CRITICAL alerts → CRITICAL status, WARNING alerts → WARNING status.
     */
    private void updateServerStatus(MonitoredServer server, AlertSeverity severity) {
        ServerStatus newStatus = switch (severity) {
            case CRITICAL -> ServerStatus.CRITICAL;
            case WARNING -> ServerStatus.WARNING;
            case INFO -> server.getStatus();
        };

        if (newStatus != server.getStatus() && server.getStatus() != ServerStatus.OFFLINE) {
            server.setStatus(newStatus);
            // ServerRepository save happens in the calling transaction
        }
    }

    /**
     * After an alert is resolved/auto-resolved, recalculate server status
     * based on remaining open alerts. If no critical/warning alerts remain,
     * restore to ONLINE.
     */
    private void updateServerStatusAfterAlertChange(MonitoredServer server) {
        if (server.getStatus() == ServerStatus.OFFLINE) {
            return;
        }

        int activeCount = alertRepository.countByServerIdAndStatus(server.getId(), AlertStatus.ACTIVE);
        int acknowledgedCount = alertRepository.countByServerIdAndStatus(server.getId(), AlertStatus.ACKNOWLEDGED);
        server.setActiveAlerts(activeCount + acknowledgedCount);

        // Check remaining alerts for severity-based status
        List<Alert> openAlerts = alertRepository.findByServerIdAndStatusNotOrderByTriggeredAtDesc(
                server.getId(), AlertStatus.RESOLVED);
        if (openAlerts == null) openAlerts = List.of();

        boolean hasCritical = openAlerts.stream()
                .anyMatch(a -> a.getSeverity() == AlertSeverity.CRITICAL);
        boolean hasWarning = openAlerts.stream()
                .anyMatch(a -> a.getSeverity() == AlertSeverity.WARNING);

        ServerStatus status = hasCritical ? ServerStatus.CRITICAL
                : hasWarning ? ServerStatus.WARNING
                : ServerStatus.ONLINE;

        if (server.getStatus() != status) {
            server.setStatus(status);
        }
    }

    /**
     * Evaluate whether a metric value satisfies the condition operator against a threshold.
     */
    private boolean evaluateCondition(double value, double threshold, ConditionOperator op) {
        return switch (op) {
            case GREATER_THAN -> value > threshold;
            case LESS_THAN -> value < threshold;
            case GREATER_THAN_OR_EQUAL -> value >= threshold;
            case LESS_THAN_OR_EQUAL -> value <= threshold;
            case EQUALS -> Math.abs(value - threshold) < 0.001;
            case NOT_EQUALS -> Math.abs(value - threshold) >= 0.001;
        };
    }

    /**
     * Check if the alert condition has been sustained for the rule's durationSeconds.
     * Queries all metrics of the same type within the duration window and verifies
     * that ALL of them breach the threshold. If no metrics exist in the window
     * (besides the current one), the condition is NOT considered sustained.
     */
    private boolean isConditionSustained(Long serverId, AlertRule rule) {
        LocalDateTime since = LocalDateTime.now().minusSeconds(rule.getDurationSeconds());
        List<Metric> recentMetrics = metricRepository.findByServerIdAndMetricTypeAndTimestampBetweenOrderByTimestampAsc(
                serverId, rule.getMetricType(), since, LocalDateTime.now());

        if (recentMetrics == null || recentMetrics.size() < 2) {
            // Need at least 2 data points to confirm sustained condition
            return false;
        }

        return recentMetrics.stream().allMatch(m ->
                evaluateCondition(m.getValue(), rule.getThresholdValue(), rule.getConditionOperator()));
    }

    /**
     * Send an email notification for a triggered alert if the user's notification
     * preferences have email enabled, the current time is not in quiet hours,
     * and the user has not exceeded their daily alert email limit.
     */
    private void sendEmailNotificationIfEnabled(User owner, Alert alert) {
        try {
            notifPrefRepo.findByUserId(owner.getId()).ifPresent(pref -> {
                if (!pref.isEmailEnabled()) {
                    return;
                }
                // Check severity-specific toggles
                AlertSeverity severity = alert.getSeverity();
                if (severity == AlertSeverity.CRITICAL && !pref.isEmailCritical()) {
                    log.debug("Skipping email for user {} (critical emails disabled)", owner.getId());
                    return;
                }
                if (severity == AlertSeverity.WARNING && !pref.isEmailWarning()) {
                    log.debug("Skipping email for user {} (warning emails disabled)", owner.getId());
                    return;
                }
                if (isInQuietHours(pref)) {
                    log.debug("Skipping email notification for user {} (quiet hours)", owner.getId());
                    return;
                }

                String email = owner.getEmail();
                if (email == null || email.isBlank()) {
                    return;
                }

                Long userId = owner.getId();

                // Check per-user daily alert email limit
                if (!emailRateLimiter.canSendAlertToUser(userId)) {
                    // Send "limit reached" notification exactly once (when count == limit)
                    if (emailRateLimiter.isUserAtLimit(userId)) {
                        log.info("User {} hit daily alert email limit ({}), sending limit notice",
                                userId, emailRateLimiter.getDailyPerUser());
                        emailService.sendDailyLimitReachedEmail(email, emailRateLimiter.getDailyPerUser());
                        // Record one extra so isUserAtLimit won't match again
                        emailRateLimiter.recordUserAlertEmail(userId);
                    } else {
                        log.debug("User {} already past daily alert email limit, suppressing", userId);
                    }
                    return;
                }

                emailService.sendAlertNotification(
                        email,
                        alert.getServer().getName(),
                        alert.getTitle(),
                        alert.getSeverity().name()
                );

                // Record the alert email for per-user tracking
                emailRateLimiter.recordUserAlertEmail(userId);

                int remaining = emailRateLimiter.getRemainingForUser(userId);
                if (remaining <= 5 && remaining > 0) {
                    log.info("User {} has {} alert emails remaining today", userId, remaining);
                }
            });
        } catch (Exception e) {
            log.warn("Failed to send alert email notification: {}", e.getMessage());
        }
    }

    /**
     * Check if the current time falls within the user's configured quiet hours.
     * Handles wraparound (e.g., quiet hours from 22:00 to 06:00).
     */
    private boolean isInQuietHours(UserNotificationPreference pref) {
        if (!pref.isQuietHoursEnabled()) {
            return false;
        }
        Integer start = pref.getQuietHoursStart();
        Integer end = pref.getQuietHoursEnd();
        if (start == null || end == null) {
            return false;
        }

        int currentHour = LocalTime.now().getHour();
        if (start <= end) {
            return currentHour >= start && currentHour < end;
        } else {
            // Wraparound: e.g., 22:00 to 06:00
            return currentHour >= start || currentHour < end;
        }
    }
}
