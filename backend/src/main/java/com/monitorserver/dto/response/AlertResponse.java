package com.monitorserver.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.monitorserver.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {

    private Long id;

    private Long serverId;

    private String serverName;

    private String type;

    private String title;

    private String message;

    private String severity;

    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime triggeredAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime acknowledgedAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime resolvedAt;

    private String note;

    private Double metricValue;

    private Double thresholdValue;

    public static AlertResponse from(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .serverId(alert.getServer().getId())
                .serverName(alert.getServer().getName())
                .type(alert.getAlertRule() != null && alert.getAlertRule().getMetricType() != null
                      ? alert.getAlertRule().getMetricType().name() : null)
                .title(alert.getTitle())
                .message(alert.getMessage())
                .severity(alert.getSeverity() != null ? alert.getSeverity().name() : null)
                .status(alert.getStatus() != null ? alert.getStatus().name() : null)
                .createdAt(alert.getTriggeredAt())
                .triggeredAt(alert.getTriggeredAt())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .resolvedAt(alert.getResolvedAt())
                .note(alert.getNote())
                .metricValue(alert.getMetricValue())
                .thresholdValue(alert.getThresholdValue())
                .build();
    }
}
