package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateAlertRuleRequest {

    private String name;

    private String description;

    private Long serverId;

    private String metricType;

    private String conditionOperator;

    private Double thresholdValue;

    private String severity;

    private Integer durationSeconds;

    private Integer cooldownMinutes = 5;

    private Boolean isEnabled = true;
}
