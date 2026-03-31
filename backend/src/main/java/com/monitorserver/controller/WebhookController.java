package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateWebhookRequest;
import com.monitorserver.dto.request.UpdateWebhookRequest;
import com.monitorserver.dto.response.WebhookConfigResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.WebhookConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final WebhookConfigService webhookConfigService;

    @GetMapping
    public ResponseEntity<List<WebhookConfigResponse>> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(webhookConfigService.getByUser(user.getId()));
    }

    @PostMapping
    public ResponseEntity<WebhookConfigResponse> create(
            @Valid @RequestBody CreateWebhookRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(webhookConfigService.create(request, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WebhookConfigResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateWebhookRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(webhookConfigService.update(id, request, user.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        webhookConfigService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
