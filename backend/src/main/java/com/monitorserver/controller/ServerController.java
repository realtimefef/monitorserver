package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateServerRequest;
import com.monitorserver.dto.request.UpdateServerRequest;
import com.monitorserver.dto.response.ServerResponse;
import com.monitorserver.entity.ServerStatus;
import com.monitorserver.entity.User;
import com.monitorserver.service.ServerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/servers")
@RequiredArgsConstructor
public class ServerController {

    private final ServerService serverService;

    @GetMapping
    public ResponseEntity<List<ServerResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serverService.findByOwner(user.getId()));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServerResponse>> getByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal User user) {
        ServerStatus serverStatus = ServerStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(serverService.findByOwnerAndStatus(user.getId(), serverStatus));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServerResponse> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serverService.findByIdAndOwner(id, user.getId()));
    }

    @PostMapping
    public ResponseEntity<ServerResponse> create(
            @Valid @RequestBody CreateServerRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(serverService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServerResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServerRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serverService.update(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        serverService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/regenerate-key")
    public ResponseEntity<Map<String, String>> regenerateKey(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(serverService.regenerateKey(id, user.getId()));
    }
}
