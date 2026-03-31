package com.monitorserver.service;

import com.monitorserver.dto.request.CreateMaintenanceWindowRequest;
import com.monitorserver.dto.response.MaintenanceWindowResponse;
import com.monitorserver.entity.MaintenanceWindow;
import com.monitorserver.entity.MonitoredServer;
import com.monitorserver.entity.User;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.MaintenanceWindowRepository;
import com.monitorserver.repository.ServerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class MaintenanceWindowService {

    private final MaintenanceWindowRepository maintenanceWindowRepository;
    private final ServerRepository serverRepository;

    @Transactional(readOnly = true)
    public List<MaintenanceWindowResponse> getByServer(Long serverId, Long userId) {
        serverRepository.findByIdAndOwnerId(serverId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", serverId));

        return maintenanceWindowRepository.findByServerIdOrderByStartTimeDesc(serverId).stream()
                .map(MaintenanceWindowResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isInMaintenance(Long serverId) {
        List<MaintenanceWindow> active = maintenanceWindowRepository.findActiveForServer(
                serverId, LocalDateTime.now());
        return !active.isEmpty();
    }

    @Transactional
    public MaintenanceWindowResponse create(Long serverId, CreateMaintenanceWindowRequest request, User user) {
        MonitoredServer server = serverRepository.findByIdAndOwnerId(serverId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Server", serverId));

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        if (request.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("End time must be in the future");
        }

        MaintenanceWindow mw = MaintenanceWindow.builder()
                .server(server)
                .createdBy(user)
                .reason(request.getReason())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .active(true)
                .build();

        mw = maintenanceWindowRepository.save(mw);
        log.info("Maintenance window created: id={}, server={}, from={}, to={}",
                mw.getId(), serverId, mw.getStartTime(), mw.getEndTime());
        return MaintenanceWindowResponse.from(mw);
    }

    @Transactional
    public void cancel(Long serverId, Long windowId, Long userId) {
        serverRepository.findByIdAndOwnerId(serverId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", serverId));

        MaintenanceWindow mw = maintenanceWindowRepository.findByIdAndServerId(windowId, serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance window", windowId));

        mw.setActive(false);
        maintenanceWindowRepository.save(mw);
        log.info("Maintenance window cancelled: id={}", windowId);
    }

    @Transactional
    public void delete(Long serverId, Long windowId, Long userId) {
        serverRepository.findByIdAndOwnerId(serverId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Server", serverId));

        MaintenanceWindow mw = maintenanceWindowRepository.findByIdAndServerId(windowId, serverId)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance window", windowId));

        maintenanceWindowRepository.delete(mw);
        log.info("Maintenance window deleted: id={}", windowId);
    }
}
