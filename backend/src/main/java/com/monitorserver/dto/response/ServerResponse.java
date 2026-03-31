package com.monitorserver.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.monitorserver.entity.MonitoredServer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServerResponse {

    private Long id;

    private String name;

    private String hostAddress;

    private String operatingSystem;

    private String status;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime lastHeartbeat;

    private String agentKey;

    private int activeAlerts;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private LocalDateTime createdAt;

    private String description;

    public static ServerResponse from(MonitoredServer server, int activeAlerts) {
        return ServerResponse.builder()
                .id(server.getId())
                .name(server.getName())
                .hostAddress(server.getHostAddress())
                .operatingSystem(server.getOperatingSystem())
                .status(server.getStatus() != null ? server.getStatus().name() : "UNKNOWN")
                .lastHeartbeat(server.getLastHeartbeat())
                .agentKey(server.getAgentKey())
                .activeAlerts(activeAlerts)
                .createdAt(server.getCreatedAt())
                .description(server.getDescription())
                .build();
    }
}
