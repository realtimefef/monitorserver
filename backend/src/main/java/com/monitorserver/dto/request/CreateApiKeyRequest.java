package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateApiKeyRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String expiresInDays;
}
