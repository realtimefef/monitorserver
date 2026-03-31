package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateReportRequest {

    private String name;

    private String format;

    private String timeframe;

    private String frequency = "MANUAL";

    private String recipients;

    private Boolean enabled;

    private Set<Long> serverIds;

    private List<String> metricTypes;
}
