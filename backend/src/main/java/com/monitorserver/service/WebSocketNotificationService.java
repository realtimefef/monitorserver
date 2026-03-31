package com.monitorserver.service;

import com.monitorserver.dto.response.AlertResponse;
import com.monitorserver.dto.response.MetricResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast a metric update to all subscribers watching a specific server's metrics.
     */
    public void broadcastMetricUpdate(Long serverId, MetricResponse metric) {
        messagingTemplate.convertAndSend(
                "/topic/servers/" + serverId + "/metrics",
                metric
        );
    }

    /**
     * Broadcast an alert update to all subscribers watching a specific user's alerts.
     */
    public void broadcastAlertUpdate(Long userId, AlertResponse alert) {
        messagingTemplate.convertAndSend(
                "/topic/alerts/user/" + userId,
                alert
        );
    }

    /**
     * Broadcast a server status change to all subscribers watching a specific user's servers.
     */
    public void broadcastServerStatusChange(Long userId, Long serverId, String status) {
        messagingTemplate.convertAndSend(
                "/topic/servers/user/" + userId,
                Map.of("serverId", serverId, "status", status)
        );
    }
}
