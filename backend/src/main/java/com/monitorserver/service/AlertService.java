package com.monitorserver.service;

import com.monitorserver.dto.response.AlertResponse;
import com.monitorserver.entity.*;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.AlertRepository;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final ServerRepository serverRepository;

    /**
     * Get all active (non-resolved) alerts for a user.
     * Returns alerts where server.owner.id == userId AND status in (ACTIVE, ACKNOWLEDGED).
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getActiveByUser(Long userId) {
        return alertRepository
                .findByServerOwnerIdAndStatusNotOrderByTriggeredAtDesc(userId, AlertStatus.RESOLVED)
                .stream()
                .map(AlertResponse::from)
                .toList();
    }

    /**
     * Get all active (non-resolved) alerts for a specific server.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getByServer(Long serverId) {
        return alertRepository
                .findByServerIdAndStatusNotOrderByTriggeredAtDesc(serverId, AlertStatus.RESOLVED)
                .stream()
                .map(AlertResponse::from)
                .toList();
    }

    /**
     * Get resolved alerts for a user, ordered by resolvedAt desc, limited by count.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getResolvedByUser(Long userId, int limit) {
        return alertRepository
                .findByServerOwnerIdAndStatusOrderByResolvedAtDesc(userId, AlertStatus.RESOLVED)
                .stream()
                .limit(limit)
                .map(AlertResponse::from)
                .toList();
    }

    /**
     * Acknowledge an alert. Verifies the alert belongs to the user via server ownership.
     * Sets status to ACKNOWLEDGED, sets note and acknowledgedAt timestamp.
     */
    @Transactional
    public void acknowledge(Long alertId, Long userId, String note) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", alertId));

        MonitoredServer server = alert.getServer();
        if (server == null || server.getOwner() == null) {
            throw new BadRequestException("Alert server or owner data is invalid");
        }

        if (!server.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Alert does not belong to current user");
        }

        if (alert.getStatus() == AlertStatus.RESOLVED) {
            throw new BadRequestException("Cannot acknowledge a resolved alert");
        }

        alert.setStatus(AlertStatus.ACKNOWLEDGED);
        alert.setAcknowledgedAt(LocalDateTime.now());
        if (note != null && !note.isBlank()) {
            alert.setNote(note);
        }
        alertRepository.save(alert);

        log.info("Alert {} acknowledged by user {}", alertId, userId);
    }

    /**
     * Resolve an alert. Verifies ownership, sets status to RESOLVED,
     * sets resolvedAt, and recalculates the server's activeAlerts count.
     */
    @Transactional
    public void resolve(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert", alertId));

        MonitoredServer server = alert.getServer();
        if (server == null || server.getOwner() == null) {
            throw new BadRequestException("Alert server or owner data is invalid");
        }

        if (!server.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Alert does not belong to current user");
        }

        if (alert.getStatus() == AlertStatus.RESOLVED) {
            throw new BadRequestException("Alert is already resolved");
        }

        alert.setStatus(AlertStatus.RESOLVED);
        alert.setResolvedAt(LocalDateTime.now());
        alertRepository.save(alert);

        // Recalculate active alerts count and server status
        int activeCount = alertRepository.countByServerIdAndStatus(server.getId(), AlertStatus.ACTIVE);
        int acknowledgedCount = alertRepository.countByServerIdAndStatus(server.getId(), AlertStatus.ACKNOWLEDGED);
        server.setActiveAlerts(activeCount + acknowledgedCount);

        // Recalculate server status based on remaining open alerts
        if (server.getStatus() != ServerStatus.OFFLINE) {
            List<Alert> openAlerts = alertRepository.findByServerIdAndStatusNotOrderByTriggeredAtDesc(
                    server.getId(), AlertStatus.RESOLVED);
            if (openAlerts == null) openAlerts = List.of();
            boolean hasCritical = openAlerts.stream()
                    .anyMatch(a -> a.getSeverity() == AlertSeverity.CRITICAL);
            boolean hasWarning = openAlerts.stream()
                    .anyMatch(a -> a.getSeverity() == AlertSeverity.WARNING);
            ServerStatus newStatus = hasCritical ? ServerStatus.CRITICAL
                    : hasWarning ? ServerStatus.WARNING
                    : ServerStatus.ONLINE;
            server.setStatus(newStatus);
        }

        serverRepository.save(server);

        log.info("Alert {} resolved by user {}", alertId, userId);
    }

    /**
     * Create an alert from a triggered alert rule.
     * Builds the Alert entity with title, message, severity from the rule,
     * increments the server's active alerts count, and returns the saved alert.
     */
    @Transactional
    public Alert createAlert(MonitoredServer server, AlertRule rule, Double metricValue) {
        Alert alert = Alert.builder()
                .server(server)
                .alertRule(rule)
                .title(rule.getName())
                .message(String.format("%s %s %.2f (current: %.2f) on %s",
                        rule.getMetricType().name(),
                        rule.getConditionOperator().name().toLowerCase().replace('_', ' '),
                        rule.getThresholdValue(),
                        metricValue,
                        server.getName()))
                .metricValue(metricValue)
                .thresholdValue(rule.getThresholdValue())
                .severity(rule.getSeverity())
                .status(AlertStatus.ACTIVE)
                .triggeredAt(LocalDateTime.now())
                .build();

        alert = alertRepository.save(alert);

        // Increment active alerts count on the server
        server.setActiveAlerts(server.getActiveAlerts() + 1);
        serverRepository.save(server);

        log.info("Alert created from rule '{}' on server '{}' -- metric value: {}, threshold: {}",
                rule.getName(), server.getName(), metricValue, rule.getThresholdValue());

        return alert;
    }

    /**
     * Get alerts by status for a user.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getByStatus(Long userId, AlertStatus status) {
        return alertRepository
                .findByServerOwnerIdAndStatusOrderByTriggeredAtDesc(userId, status)
                .stream()
                .map(AlertResponse::from)
                .toList();
    }
}
