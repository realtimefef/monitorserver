package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateAlertRuleRequest;
import com.monitorserver.dto.response.AlertResponse;
import com.monitorserver.dto.response.AlertRuleResponse;
import com.monitorserver.dto.response.ApiResponse;
import com.monitorserver.entity.AlertStatus;
import com.monitorserver.entity.User;
import com.monitorserver.service.AlertRuleService;
import com.monitorserver.service.AlertService;
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
@RequestMapping("/api/v1/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final AlertRuleService alertRuleService;
    private final ServerService serverService;

    /**
     * GET /api/v1/alerts
     * Get active alerts for the current user.
     * Optional query param: serverId -- filter by server.
     */
    @GetMapping
    public ResponseEntity<List<AlertResponse>> getActive(
            @RequestParam(required = false) Long serverId,
            @AuthenticationPrincipal User user) {

        if (serverId != null) {
            // Verify server belongs to user before returning alerts
            serverService.findByIdAndOwner(serverId, user.getId());
            return ResponseEntity.ok(alertService.getByServer(serverId));
        }
        return ResponseEntity.ok(alertService.getActiveByUser(user.getId()));
    }

    /**
     * GET /api/v1/alerts/resolved
     * Get resolved alerts for the current user, limited by count.
     */
    @GetMapping("/resolved")
    public ResponseEntity<List<AlertResponse>> getResolved(
            @RequestParam(defaultValue = "100") int limit,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(alertService.getResolvedByUser(user.getId(), limit));
    }

    /**
     * GET /api/v1/alerts/status/{status}
     * Get alerts filtered by status for the current user.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AlertResponse>> getByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal User user) {

        AlertStatus alertStatus = AlertStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(alertService.getByStatus(user.getId(), alertStatus));
    }

    /**
     * POST /api/v1/alerts/{id}/acknowledge
     * Acknowledge an alert. Optionally include a note in the request body.
     */
    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledge(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal User user) {

        String note = (body != null) ? body.get("note") : null;
        alertService.acknowledge(id, user.getId(), note);
        return ResponseEntity.ok(new ApiResponse<>(true, "Alert acknowledged.", null));
    }

    /**
     * POST /api/v1/alerts/{id}/resolve
     * Resolve an alert.
     */
    @PostMapping("/{id}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolve(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        alertService.resolve(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Alert resolved.", null));
    }

    // ==================== Alert Rules ====================

    /**
     * GET /api/v1/alerts/rules/enabled
     * Get all enabled alert rules for the current user.
     */
    @GetMapping("/rules/enabled")
    public ResponseEntity<List<AlertRuleResponse>> getEnabledRules(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(alertRuleService.getEnabledByOwner(user.getId()));
    }

    /**
     * GET /api/v1/alerts/rules?serverId={id}
     * Get alert rules for a server.
     */
    @GetMapping("/rules")
    public ResponseEntity<List<AlertRuleResponse>> getRules(
            @RequestParam Long serverId,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(alertRuleService.getByServer(serverId, user.getId()));
    }

    /**
     * POST /api/v1/alerts/rules
     * Create a new alert rule.
     */
    @PostMapping("/rules")
    public ResponseEntity<AlertRuleResponse> createRule(
            @Valid @RequestBody CreateAlertRuleRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alertRuleService.create(request, user.getId()));
    }

    /**
     * PUT /api/v1/alerts/rules/{id}
     * Update an existing alert rule.
     */
    @PutMapping("/rules/{id}")
    public ResponseEntity<AlertRuleResponse> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody CreateAlertRuleRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(alertRuleService.update(id, request, user.getId()));
    }

    /**
     * POST /api/v1/alerts/rules/{id}/toggle
     * Toggle the enabled state of an alert rule.
     */
    @PostMapping("/rules/{id}/toggle")
    public ResponseEntity<ApiResponse<Void>> toggleRule(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        alertRuleService.toggle(id, user.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Rule toggled.", null));
    }

    /**
     * DELETE /api/v1/alerts/rules/{id}
     * Delete an alert rule.
     */
    @DeleteMapping("/rules/{id}")
    public ResponseEntity<Void> deleteRule(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        alertRuleService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
