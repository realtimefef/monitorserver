package com.monitorserver.dto.response;

import com.monitorserver.entity.MaintenanceWindow;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceWindowResponse {

    private Long id;
    private Long serverId;
    private String reason;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean active;
    private String createdByUsername;
    private LocalDateTime createdAt;

    public static MaintenanceWindowResponse from(MaintenanceWindow mw) {
        return MaintenanceWindowResponse.builder()
                .id(mw.getId())
                .serverId(mw.getServer().getId())
                .reason(mw.getReason())
                .startTime(mw.getStartTime())
                .endTime(mw.getEndTime())
                .active(mw.isActive())
                .createdByUsername(mw.getCreatedBy().getUsername())
                .createdAt(mw.getCreatedAt())
                .build();
    }
}
