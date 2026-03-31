package com.monitorserver.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.monitorserver.entity.Metric;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetricResponse {

    private Long id;

    private Long serverId;

    private String metricType;

    private Double value;

    private String unit;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime timestamp;

    public static MetricResponse from(Metric metric) {
        return MetricResponse.builder()
                .id(metric.getId())
                .serverId(metric.getServer().getId())
                .metricType(metric.getMetricType() != null ? metric.getMetricType().name() : null)
                .value(metric.getValue())
                .unit(metric.getUnit())
                .timestamp(metric.getTimestamp())
                .build();
    }
}
