package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MetricIngestRequest {

    @NotBlank(message = "Agent key is required")
    private String agentKey;

    @NotNull(message = "Metrics list is required")
    @Size(min = 1, max = 50, message = "Metrics list must have 1–50 entries")
    @Valid
    private List<MetricEntry> metrics;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MetricEntry {

        @NotBlank(message = "Metric type is required")
        @JsonAlias("metricType")
        private String type;

        @NotNull(message = "Metric value is required")
        private Double value;

        private String unit;
    }
}
