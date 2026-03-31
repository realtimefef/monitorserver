package com.monitorserver.controller;

import com.monitorserver.dto.request.MetricIngestRequest;
import com.monitorserver.dto.response.ApiResponse;
import com.monitorserver.dto.response.MetricResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.MetricService;
import com.monitorserver.service.ServerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@RequiredArgsConstructor
public class MetricController {

    private final MetricService metricService;
    private final ServerService serverService;

    @PostMapping("/metrics/ingest")
    public ResponseEntity<ApiResponse<Void>> ingest(@Valid @RequestBody MetricIngestRequest request) {
        metricService.ingest(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Metrics ingested.", null));
    }

    @PostMapping("/metrics/heartbeat")
    public ResponseEntity<ApiResponse<Void>> heartbeat(@RequestParam String agentKey) {
        metricService.heartbeat(agentKey);
        return ResponseEntity.ok(new ApiResponse<>(true, "OK", null));
    }

    @GetMapping("/servers/{serverId}/metrics")
    public ResponseEntity<List<MetricResponse>> getHistory(
            @PathVariable Long serverId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @AuthenticationPrincipal User user) {
        // Verify server belongs to user
        serverService.findByIdAndOwner(serverId, user.getId());

        LocalDateTime startTime = start != null
                ? parseTimestamp(start)
                : LocalDateTime.now().minusDays(1);

        LocalDateTime endTime = end != null
                ? parseTimestamp(end)
                : LocalDateTime.now();

        return ResponseEntity.ok(metricService.getHistory(serverId, type, startTime, endTime));
    }

    @GetMapping("/servers/{serverId}/metrics/latest")
    public ResponseEntity<?> getLatest(
            @PathVariable Long serverId,
            @RequestParam(required = false) String type,
            @AuthenticationPrincipal User user) {
        // Verify server belongs to user
        serverService.findByIdAndOwner(serverId, user.getId());

        if (type != null && !type.isBlank()) {
            MetricResponse metric = metricService.getLatest(serverId, type);
            return ResponseEntity.ok(metric);
        }
        return ResponseEntity.ok(metricService.getLatestAll(serverId));
    }

    @GetMapping("/servers/{serverId}/metrics/average")
    public ResponseEntity<?> getAverage(
            @PathVariable Long serverId,
            @RequestParam String type,
            @RequestParam(defaultValue = "60") int minutes,
            @AuthenticationPrincipal User user) {
        serverService.findByIdAndOwner(serverId, user.getId());
        Double avg = metricService.getAverage(serverId, type, minutes);
        return ResponseEntity.ok(java.util.Map.of(
                "type", type,
                "minutes", minutes,
                "average", avg != null ? avg : 0.0));
    }

    /**
     * Parse an ISO 8601 timestamp string.
     * Handles formats like "2025-03-25T10:00:00.000Z" by stripping the Z suffix
     * and any trailing milliseconds that LocalDateTime.parse can handle.
     */
    private LocalDateTime parseTimestamp(String timestamp) {
        // Remove trailing Z (UTC indicator) since we store as LocalDateTime
        String cleaned = timestamp;
        if (cleaned.endsWith("Z")) {
            cleaned = cleaned.substring(0, cleaned.length() - 1);
        }
        return LocalDateTime.parse(cleaned);
    }
}
