package com.monitorserver.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateServerRequest {

    private String name;

    private String hostAddress;

    private String operatingSystem;

    private String description;
}
