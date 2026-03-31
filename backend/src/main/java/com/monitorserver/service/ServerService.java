package com.monitorserver.service;

import com.monitorserver.dto.request.CreateServerRequest;
import com.monitorserver.dto.request.UpdateServerRequest;
import com.monitorserver.dto.response.ServerResponse;
import com.monitorserver.entity.AlertStatus;
import com.monitorserver.entity.MonitoredServer;
import com.monitorserver.entity.ServerStatus;
import com.monitorserver.entity.User;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.AlertRepository;
import com.monitorserver.repository.AlertRuleRepository;
import com.monitorserver.repository.MetricRepository;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ServerService {

    private final ServerRepository serverRepository;
    private final AlertRepository alertRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final MetricRepository metricRepository;

    /**
     * Get all servers owned by the given user, including active alert counts.
     */
    @Transactional(readOnly = true)
    public List<ServerResponse> findByOwner(Long userId) {
        return serverRepository.findByOwnerId(userId).stream()
                .map(server -> {
                    int activeAlerts = alertRepository.countByServerIdAndStatus(
                            server.getId(), AlertStatus.ACTIVE);
                    return ServerResponse.from(server, activeAlerts);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get servers owned by a user filtered by status.
     */
    @Transactional(readOnly = true)
    public List<ServerResponse> findByOwnerAndStatus(Long userId, ServerStatus status) {
        return serverRepository.findByOwnerIdAndStatus(userId, status).stream()
                .map(server -> {
                    int activeAlerts = alertRepository.countByServerIdAndStatus(
                            server.getId(), AlertStatus.ACTIVE);
                    return ServerResponse.from(server, activeAlerts);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get a single server by ID, verifying it belongs to the given user.
     * Throws ResourceNotFoundException if not found.
     */
    @Transactional(readOnly = true)
    public ServerResponse findByIdAndOwner(Long id, Long userId) {
        MonitoredServer server = serverRepository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));

        int activeAlerts = alertRepository.countByServerIdAndStatus(
                server.getId(), AlertStatus.ACTIVE);
        return ServerResponse.from(server, activeAlerts);
    }

    /**
     * Create a new monitored server for the given owner.
     */
    @Transactional
    public ServerResponse create(CreateServerRequest request, User owner) {
        MonitoredServer server = MonitoredServer.builder()
                .name(request.getName())
                .hostAddress(request.getHostAddress())
                .operatingSystem(request.getOperatingSystem())
                .description(request.getDescription())
                .agentKey(UUID.randomUUID().toString().replace("-", ""))
                .owner(owner)
                .build();

        server = serverRepository.save(server);
        log.info("Server created: id={}, name={}, owner={}", server.getId(), server.getName(), owner.getId());

        return ServerResponse.from(server, 0);
    }

    /**
     * Update a server's properties. Only non-null fields are updated.
     */
    @Transactional
    public ServerResponse update(Long id, UpdateServerRequest request, Long userId) {
        MonitoredServer server = serverRepository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));

        if (request.getName() != null && !request.getName().isBlank()) {
            server.setName(request.getName());
        }
        if (request.getHostAddress() != null && !request.getHostAddress().isBlank()) {
            server.setHostAddress(request.getHostAddress());
        }
        if (request.getOperatingSystem() != null) {
            server.setOperatingSystem(request.getOperatingSystem());
        }
        if (request.getDescription() != null) {
            server.setDescription(request.getDescription());
        }

        server = serverRepository.save(server);
        log.info("Server updated: id={}, name={}", server.getId(), server.getName());

        int activeAlerts = alertRepository.countByServerIdAndStatus(
                server.getId(), AlertStatus.ACTIVE);
        return ServerResponse.from(server, activeAlerts);
    }

    /**
     * Delete a server and all its metrics. Verifies ownership first.
     */
    @Transactional
    public void delete(Long id, Long userId) {
        MonitoredServer server = serverRepository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));

        // Delete dependent records before server to avoid FK constraint violations
        alertRepository.deleteByServerId(server.getId());
        alertRuleRepository.deleteByServerId(server.getId());
        metricRepository.deleteByServerId(server.getId());

        serverRepository.delete(server);
        log.info("Server deleted: id={}, name={}", id, server.getName());
    }

    /**
     * Regenerate the agent key for a server.
     * Returns a map containing the new agent key.
     */
    @Transactional
    public Map<String, String> regenerateKey(Long id, Long userId) {
        MonitoredServer server = serverRepository.findByIdAndOwnerId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", id));

        String newKey = UUID.randomUUID().toString().replace("-", "");
        server.setAgentKey(newKey);
        serverRepository.save(server);

        log.info("Agent key regenerated for server: id={}", id);
        return Map.of("agentKey", newKey);
    }
}
