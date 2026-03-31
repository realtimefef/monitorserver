package com.monitorserver.controller;

import com.monitorserver.dto.request.UpdateNotificationPreferenceRequest;
import com.monitorserver.dto.response.NotificationPreferenceResponse;
import com.monitorserver.dto.response.NotificationResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.NotificationPreferenceService;
import com.monitorserver.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationPreferenceService notificationPreferenceService;
    private final NotificationService notificationService;

    /**
     * GET /api/v1/notifications/preferences
     * Get the current user's notification preferences.
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(notificationPreferenceService.get(user.getId()));
    }

    /**
     * PUT /api/v1/notifications/preferences
     * Update the current user's notification preferences.
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(
            @RequestBody UpdateNotificationPreferenceRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(notificationPreferenceService.update(user.getId(), request));
    }

    /**
     * GET /api/v1/notifications/alert/{alertId}
     * Get notification history for a specific alert.
     */
    @GetMapping("/alert/{alertId}")
    public ResponseEntity<List<NotificationResponse>> getByAlert(
            @PathVariable Long alertId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                notificationService.getByAlertId(alertId).stream()
                        .map(NotificationResponse::from)
                        .toList()
        );
    }

    /**
     * GET /api/v1/notifications/history
     * Get all notification history for the current user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<NotificationResponse>> getHistory(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(
                notificationService.getByUserId(user.getId()).stream()
                        .map(NotificationResponse::from)
                        .toList()
        );
    }
}
