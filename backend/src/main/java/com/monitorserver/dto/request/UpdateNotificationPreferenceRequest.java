package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateNotificationPreferenceRequest {

    private Boolean emailEnabled;

    private Boolean emailCritical;

    private Boolean emailWarning;

    private Boolean quietHoursEnabled;

    private Integer quietHoursStart;

    private Integer quietHoursEnd;

    private String timezone;
}
