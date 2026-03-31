package com.monitorserver.service;

import com.monitorserver.dto.request.CreateAlertRuleRequest;
import com.monitorserver.dto.response.AlertRuleResponse;
import com.monitorserver.entity.*;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.AlertRuleRepository;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class AlertRuleService {

    private final AlertRuleRepository alertRuleRepository;
    private final ServerRepository serverRepository;

    /**
     * Get all alert rules for a server. Verifies server ownership.
     */
    @Transactional(readOnly = true)
    public List<AlertRuleResponse> getByServer(Long serverId, Long userId) {
        MonitoredServer server = serverRepository.findById(serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", serverId));

        if (!server.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Server does not belong to current user");
        }

        return alertRuleRepository.findByServerId(serverId)
                .stream()
                .map(AlertRuleResponse::from)
                .toList();
    }

    /**
     * Create a new alert rule for a server. Verifies server ownership.
     * Builds the AlertRule entity from the request and saves it.
     */
    @Transactional
    public AlertRuleResponse create(CreateAlertRuleRequest request, Long userId) {
        if (request.getServerId() == null) {
            throw new BadRequestException("serverId is required");
        }

        MonitoredServer server = serverRepository.findById(request.getServerId())
                .orElseThrow(() -> new ResourceNotFoundException("Server", request.getServerId()));

        if (!server.getOwner().getId().equals(userId)) {
            throw new BadRequestException("Server does not belong to current user");
        }

        AlertRule rule = AlertRule.builder()
                .name(request.getName())
                .description(request.getDescription())
                .server(server)
                .metricType(MetricType.valueOf(request.getMetricType()))
                .conditionOperator(ConditionOperator.valueOf(request.getConditionOperator()))
                .thresholdValue(request.getThresholdValue())
                .severity(request.getSeverity() != null
                        ? AlertSeverity.valueOf(request.getSeverity())
                        : AlertSeverity.WARNING)
                .durationSeconds(request.getDurationSeconds())
                .cooldownMinutes(request.getCooldownMinutes() != null
                        ? request.getCooldownMinutes()
                        : 5)
                .isEnabled(request.getIsEnabled() != null
                        ? request.getIsEnabled()
                        : true)
                .build();

        rule = alertRuleRepository.save(rule);

        log.info("Alert rule '{}' created for server '{}' by user {}",
                rule.getName(), server.getName(), userId);

        return AlertRuleResponse.from(rule);
    }

    /**
     * Update an existing alert rule. Verifies ownership via server owner chain.
     * Only updates fields that are non-null in the request.
     */
    @Transactional
    public AlertRuleResponse update(Long ruleId, CreateAlertRuleRequest request, Long userId) {
        AlertRule rule = alertRuleRepository.findByIdAndServerOwnerId(ruleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlertRule", ruleId));

        if (request.getName() != null) {
            rule.setName(request.getName());
        }
        if (request.getDescription() != null) {
            rule.setDescription(request.getDescription());
        }
        if (request.getMetricType() != null) {
            rule.setMetricType(MetricType.valueOf(request.getMetricType()));
        }
        if (request.getConditionOperator() != null) {
            rule.setConditionOperator(ConditionOperator.valueOf(request.getConditionOperator()));
        }
        if (request.getThresholdValue() != null) {
            rule.setThresholdValue(request.getThresholdValue());
        }
        if (request.getSeverity() != null) {
            rule.setSeverity(AlertSeverity.valueOf(request.getSeverity()));
        }
        if (request.getDurationSeconds() != null) {
            rule.setDurationSeconds(request.getDurationSeconds());
        }
        if (request.getCooldownMinutes() != null) {
            rule.setCooldownMinutes(request.getCooldownMinutes());
        }
        if (request.getIsEnabled() != null) {
            rule.setEnabled(request.getIsEnabled());
        }

        rule = alertRuleRepository.save(rule);

        log.info("Alert rule {} updated by user {}", ruleId, userId);

        return AlertRuleResponse.from(rule);
    }

    /**
     * Toggle the enabled state of an alert rule. Verifies ownership.
     */
    @Transactional
    public void toggle(Long ruleId, Long userId) {
        AlertRule rule = alertRuleRepository.findByIdAndServerOwnerId(ruleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlertRule", ruleId));

        rule.setEnabled(!rule.isEnabled());
        alertRuleRepository.save(rule);

        log.info("Alert rule {} toggled to {} by user {}", ruleId, rule.isEnabled(), userId);
    }

    /**
     * Delete an alert rule. Verifies ownership.
     */
    @Transactional
    public void delete(Long ruleId, Long userId) {
        AlertRule rule = alertRuleRepository.findByIdAndServerOwnerId(ruleId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlertRule", ruleId));

        alertRuleRepository.delete(rule);

        log.info("Alert rule {} deleted by user {}", ruleId, userId);
    }

    /**
     * Get all enabled alert rules for a user across all their servers.
     */
    @Transactional(readOnly = true)
    public List<AlertRuleResponse> getEnabledByOwner(Long userId) {
        return alertRuleRepository.findByServerOwnerIdAndIsEnabledTrue(userId)
                .stream()
                .map(AlertRuleResponse::from)
                .toList();
    }
}
