package com.monitorserver.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.monitorserver.entity.AlertRule;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRuleResponse {

    private Long id;

    private Long serverId;

    private String name;

    private String description;

    private String metricType;

    private String conditionOperator;

    private Double thresholdValue;

    private String severity;

    private Boolean isEnabled;

    private Integer durationSeconds;

    private Integer cooldownMinutes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime createdAt;

    public static AlertRuleResponse from(AlertRule rule) {
        return AlertRuleResponse.builder()
                .id(rule.getId())
                .serverId(rule.getServer().getId())
                .name(rule.getName())
                .description(rule.getDescription())
                .metricType(rule.getMetricType() != null ? rule.getMetricType().name() : null)
                .conditionOperator(rule.getConditionOperator() != null ? rule.getConditionOperator().name() : null)
                .thresholdValue(rule.getThresholdValue())
                .severity(rule.getSeverity() != null ? rule.getSeverity().name() : null)
                .isEnabled(rule.isEnabled())
                .durationSeconds(rule.getDurationSeconds())
                .cooldownMinutes(rule.getCooldownMinutes())
                .createdAt(rule.getCreatedAt())
                .build();
    }
}
