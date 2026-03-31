package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateWebhookRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "URL is required")
    private String url;

    private String type = "GENERIC";

    private Boolean notifyCritical = true;

    private Boolean notifyWarning = true;

    private Boolean notifyInfo = false;
}
