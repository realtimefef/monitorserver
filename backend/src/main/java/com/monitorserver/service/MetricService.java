package com.monitorserver.service;

import com.monitorserver.dto.request.MetricIngestRequest;
import com.monitorserver.dto.response.MetricResponse;
import com.monitorserver.entity.*;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.AgentActivityRepository;
import com.monitorserver.repository.MetricRepository;
import com.monitorserver.repository.ServerRepository;
import com.monitorserver.repository.UserUsageStatsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MetricService {

    private final MetricRepository metricRepository;
    private final ServerRepository serverRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final AgentActivityRepository agentActivityRepository;
    private final UserUsageStatsRepository userUsageStatsRepository;

    @Value("${app.metrics.retention-days:30}")
    private int retentionDays;

    @Lazy
    @Autowired
    private AlertEvaluationService alertEvaluationService;

    /**
     * Ingest metrics from an agent. Finds the server by agentKey,
     * updates heartbeat/status, saves each metric entry, broadcasts via WebSocket,
     * and triggers alert evaluation.
     */
    @Transactional
    public void ingest(MetricIngestRequest request) {
        if (request.getAgentKey() == null || request.getAgentKey().isBlank()) {
            throw new BadRequestException("agentKey is required");
        }

        MonitoredServer server = serverRepository.findByAgentKey(request.getAgentKey())
                .orElseThrow(() -> new ResourceNotFoundException("Server", "agentKey", request.getAgentKey()));

        // Update server heartbeat and status
        server.setLastHeartbeat(LocalDateTime.now());
        server.setStatus(ServerStatus.ONLINE);
        serverRepository.save(server);

        List<Metric> savedMetrics = new ArrayList<>();

        if (request.getMetrics() != null) {
            for (MetricIngestRequest.MetricEntry entry : request.getMetrics()) {
                MetricType metricType;
                try {
                    metricType = MetricType.valueOf(entry.getType().toUpperCase());
                } catch (IllegalArgumentException e) {
                    log.warn("Unknown metric type '{}', skipping", entry.getType());
                    continue;
                }

                Metric metric = Metric.builder()
                        .server(server)
                        .metricType(metricType)
                        .value(entry.getValue())
                        .unit(entry.getUnit())
                        .timestamp(LocalDateTime.now())
                        .build();

                savedMetrics.add(metricRepository.save(metric));
            }
        }

        // Broadcast via WebSocket: /topic/servers/{serverId}/metrics
        List<MetricResponse> metricResponses = savedMetrics.stream()
                .map(MetricResponse::from)
                .collect(Collectors.toList());

        if (!metricResponses.isEmpty()) {
            try {
                messagingTemplate.convertAndSend(
                        "/topic/servers/" + server.getId() + "/metrics",
                        metricResponses
                );
            } catch (Exception e) {
                log.warn("Failed to broadcast metrics via WebSocket: {}", e.getMessage());
            }
        }

        // Trigger alert evaluation for each saved metric
        for (Metric metric : savedMetrics) {
            try {
                alertEvaluationService.evaluate(metric, server);
            } catch (Exception e) {
                log.warn("Alert evaluation failed for metric {}: {}", metric.getMetricType(), e.getMessage());
            }
        }

        log.debug("Ingested {} metrics for server id={}", savedMetrics.size(), server.getId());

        // Record agent activity
        recordAgentActivity(server, AgentEventType.METRIC_INGEST, savedMetrics.size());

        // Update user usage stats
        updateUserUsageStats(server.getOwner(), savedMetrics.size());
    }

    /**
     * Record a heartbeat from an agent without any metric data.
     * Updates the server's lastHeartbeat and sets status to ONLINE.
     */
    @Transactional
    public void heartbeat(String agentKey) {
        MonitoredServer server = serverRepository.findByAgentKey(agentKey)
                .orElseThrow(() -> new ResourceNotFoundException("Server", "agentKey", agentKey));

        server.setLastHeartbeat(LocalDateTime.now());
        server.setStatus(ServerStatus.ONLINE);
        serverRepository.save(server);

        log.debug("Heartbeat received for server id={}", server.getId());

        // Record agent activity
        recordAgentActivity(server, AgentEventType.HEARTBEAT, 0);

        // Update user usage stats
        updateUserUsageStats(server.getOwner(), 0);
    }

    /**
     * Get metric history for a server within a time range.
     * If type is null, returns all metric types for the server.
     */
    @Transactional(readOnly = true)
    public List<MetricResponse> getHistory(Long serverId, String type,
                                           LocalDateTime start, LocalDateTime end) {
        List<Metric> metrics;

        if (type != null && !type.isBlank()) {
            MetricType metricType = MetricType.valueOf(type.toUpperCase());
            metrics = metricRepository
                    .findByServerIdAndMetricTypeAndTimestampBetweenOrderByTimestampAsc(
                            serverId, metricType, start, end);
        } else {
            metrics = metricRepository
                    .findByServerIdAndTimestampBetweenOrderByTimestampAsc(
                            serverId, start, end);
        }

        return metrics.stream()
                .map(MetricResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get the latest metric of a given type for a server.
     */
    @Transactional(readOnly = true)
    public MetricResponse getLatest(Long serverId, String type) {
        MetricType metricType = MetricType.valueOf(type.toUpperCase());
        Metric metric = metricRepository
                .findFirstByServerIdAndMetricTypeOrderByTimestampDesc(serverId, metricType)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No metrics found for server " + serverId + " and type " + type));
        return MetricResponse.from(metric);
    }

    /**
     * Get the latest metric for each metric type for a server.
     */
    @Transactional(readOnly = true)
    public List<MetricResponse> getLatestAll(Long serverId) {
        return metricRepository.findLatestPerTypeByServerId(serverId).stream()
                .map(MetricResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get the average value of a metric type for a server over the last N minutes.
     */
    @Transactional(readOnly = true)
    public Double getAverage(Long serverId, String type, int minutes) {
        MetricType metricType = MetricType.valueOf(type.toUpperCase());
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        Double avg = metricRepository.findAverageValue(serverId, metricType, since);
        return avg != null ? avg : 0.0;
    }

    /**
     * Scheduled cleanup job that runs daily at 2:00 AM.
     * Deletes metrics older than the configured retention period.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupOldMetrics() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(retentionDays);
        metricRepository.deleteByTimestampBefore(cutoff);
        agentActivityRepository.deleteByTimestampBefore(cutoff);
        log.info("Cleaned up metrics and agent activity older than {} days", retentionDays);
    }

    // ── Agent activity & user usage helpers ──────────────────────────────────

    private void recordAgentActivity(MonitoredServer server, AgentEventType eventType, int metricsCount) {
        try {
            AgentActivity activity = AgentActivity.builder()
                    .server(server)
                    .eventType(eventType)
                    .metricsCount(metricsCount)
                    .timestamp(LocalDateTime.now())
                    .build();
            agentActivityRepository.save(activity);
        } catch (Exception e) {
            log.warn("Failed to record agent activity: {}", e.getMessage());
        }
    }

    private void updateUserUsageStats(User owner, int metricsCount) {
        try {
            UserUsageStats stats = userUsageStatsRepository.findByUserId(owner.getId())
                    .orElseGet(() -> UserUsageStats.builder()
                            .user(owner)
                            .build());

            stats.setTotalAgentRequests(stats.getTotalAgentRequests() + 1);
            stats.setTotalMetricsReceived(stats.getTotalMetricsReceived() + metricsCount);
            stats.setLastActiveAt(LocalDateTime.now());

            userUsageStatsRepository.save(stats);
        } catch (Exception e) {
            log.warn("Failed to update user usage stats: {}", e.getMessage());
        }
    }
}
