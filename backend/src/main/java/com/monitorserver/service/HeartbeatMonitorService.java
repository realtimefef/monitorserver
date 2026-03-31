package com.monitorserver.service;

import com.monitorserver.entity.MonitoredServer;
import com.monitorserver.entity.ServerStatus;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class HeartbeatMonitorService {

    private final ServerRepository serverRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Scheduled job that runs every 30 seconds to detect servers
     * that have not sent a heartbeat within the last 120 seconds.
     * Marks those servers as OFFLINE and broadcasts the status change via WebSocket.
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void checkHeartbeats() {
        LocalDateTime threshold = LocalDateTime.now().minusSeconds(120);

        List<MonitoredServer> staleServers = serverRepository.findServersWithStaleHeartbeat(
                threshold, ServerStatus.OFFLINE
        );

        for (MonitoredServer server : staleServers) {
            server.setStatus(ServerStatus.OFFLINE);
            serverRepository.save(server);

            log.info("Server '{}' (id={}) marked OFFLINE (no heartbeat since {})",
                    server.getName(), server.getId(), server.getLastHeartbeat());

            // Broadcast status change via WebSocket
            try {
                messagingTemplate.convertAndSend(
                        "/topic/servers/user/" + server.getOwner().getId(),
                        Map.of("serverId", server.getId(), "status", "OFFLINE")
                );
            } catch (Exception e) {
                log.warn("Failed to broadcast OFFLINE status for server {}: {}",
                        server.getId(), e.getMessage());
            }
        }

        if (!staleServers.isEmpty()) {
            log.info("Marked {} servers OFFLINE", staleServers.size());
        }
    }
}
