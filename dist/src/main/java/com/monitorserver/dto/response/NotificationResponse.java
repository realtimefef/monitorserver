package com.monitorserver.dto.response;

import com.monitorserver.entity.Notification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private Long alertId;
    private Long userId;
    private String channel;
    private String subject;
    private String content;
    private String status;
    private LocalDateTime sentAt;
    private String errorMessage;
    private int retryCount;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .alertId(n.getAlert().getId())
                .userId(n.getUser().getId())
                .channel(n.getChannel().name())
                .subject(n.getSubject())
                .content(n.getContent())
                .status(n.getStatus().name())
                .sentAt(n.getSentAt())
                .errorMessage(n.getErrorMessage())
                .retryCount(n.getRetryCount())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
