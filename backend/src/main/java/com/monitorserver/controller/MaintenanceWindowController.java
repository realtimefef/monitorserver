package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateMaintenanceWindowRequest;
import com.monitorserver.dto.response.MaintenanceWindowResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.MaintenanceWindowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/servers/{serverId}/maintenance")
@RequiredArgsConstructor
public class MaintenanceWindowController {

    private final MaintenanceWindowService maintenanceWindowService;

    @GetMapping
    public ResponseEntity<List<MaintenanceWindowResponse>> getAll(
            @PathVariable Long serverId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(maintenanceWindowService.getByServer(serverId, user.getId()));
    }

    @PostMapping
    public ResponseEntity<MaintenanceWindowResponse> create(
            @PathVariable Long serverId,
            @Valid @RequestBody CreateMaintenanceWindowRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceWindowService.create(serverId, request, user));
    }

    @PostMapping("/{windowId}/cancel")
    public ResponseEntity<Void> cancel(
            @PathVariable Long serverId,
            @PathVariable Long windowId,
            @AuthenticationPrincipal User user) {
        maintenanceWindowService.cancel(serverId, windowId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{windowId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long serverId,
            @PathVariable Long windowId,
            @AuthenticationPrincipal User user) {
        maintenanceWindowService.delete(serverId, windowId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
