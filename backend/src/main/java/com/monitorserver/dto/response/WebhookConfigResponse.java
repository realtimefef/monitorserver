package com.monitorserver.dto.response;

import com.monitorserver.entity.WebhookConfig;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookConfigResponse {

    private Long id;
    private String name;
    private String url;
    private String type;
    private boolean enabled;
    private boolean notifyCritical;
    private boolean notifyWarning;
    private boolean notifyInfo;
    private LocalDateTime lastTriggeredAt;
    private String lastError;
    private LocalDateTime createdAt;

    public static WebhookConfigResponse from(WebhookConfig wh) {
        return WebhookConfigResponse.builder()
                .id(wh.getId())
                .name(wh.getName())
                .url(wh.getUrl())
                .type(wh.getType().name())
                .enabled(wh.isEnabled())
                .notifyCritical(wh.isNotifyCritical())
                .notifyWarning(wh.isNotifyWarning())
                .notifyInfo(wh.isNotifyInfo())
                .lastTriggeredAt(wh.getLastTriggeredAt())
                .lastError(wh.getLastError())
                .createdAt(wh.getCreatedAt())
                .build();
    }
}
