package com.monitorserver.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.monitorserver.entity.ScheduledReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledReportResponse {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    private String name;

    private String format;

    private String timeframe;

    private String frequency;

    private String recipients;

    private Boolean enabled;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime lastGenerated;

    private Set<Long> serverIds;

    private String[] metricTypes;

    public static ScheduledReportResponse from(ScheduledReport report) {
        return ScheduledReportResponse.builder()
                .id(report.getId())
                .name(report.getName())
                .format(report.getFormat() != null ? report.getFormat().name() : null)
                .timeframe(report.getTimeframe())
                .frequency(report.getFrequency())
                .recipients(report.getRecipients())
                .enabled(report.isEnabled())
                .lastGenerated(report.getLastGeneratedAt())
                .serverIds(report.getServerIds())
                .metricTypes(report.getMetricTypes().stream()
                        .map(Enum::name).toArray(String[]::new))
                .build();
    }
}
