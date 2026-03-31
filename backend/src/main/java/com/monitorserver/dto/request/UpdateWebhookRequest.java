package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateWebhookRequest {

    private String name;

    private String url;

    private String type;

    private Boolean enabled;

    private Boolean notifyCritical;

    private Boolean notifyWarning;

    private Boolean notifyInfo;
}
