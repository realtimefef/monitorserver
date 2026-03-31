package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateApiKeyRequest;
import com.monitorserver.dto.response.ApiKeyResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.ApiKeyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    @GetMapping
    public ResponseEntity<List<ApiKeyResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(apiKeyService.getByUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<ApiKeyResponse> create(
            @Valid @RequestBody CreateApiKeyRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(apiKeyService.create(request, user));
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<Void> revoke(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        apiKeyService.revoke(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        apiKeyService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
