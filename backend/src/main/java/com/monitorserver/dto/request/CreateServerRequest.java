package com.monitorserver.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateServerRequest {

    @NotBlank(message = "Server name is required")
    private String name;

    @NotBlank(message = "Host address is required")
    private String hostAddress;

    private String operatingSystem;

    private String description;
}
