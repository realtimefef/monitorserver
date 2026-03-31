package com.monitorserver.controller;

import com.monitorserver.dto.request.CreateReportRequest;
import com.monitorserver.dto.response.ScheduledReportResponse;
import com.monitorserver.entity.User;
import com.monitorserver.service.ScheduledReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ScheduledReportService scheduledReportService;

    /**
     * GET /api/v1/reports
     * Get all scheduled reports for the current user.
     */
    @GetMapping
    public ResponseEntity<List<ScheduledReportResponse>> getAll(
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(scheduledReportService.getAll(user.getId()));
    }

    /**
     * POST /api/v1/reports
     * Create a new scheduled report.
     */
    @PostMapping
    public ResponseEntity<ScheduledReportResponse> create(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(scheduledReportService.create(request, user));
    }

    /**
     * PUT /api/v1/reports/{id}
     * Update an existing scheduled report.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ScheduledReportResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal User user) {

        return ResponseEntity.ok(scheduledReportService.update(id, request, user.getId()));
    }

    /**
     * DELETE /api/v1/reports/{id}
     * Delete a scheduled report.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        scheduledReportService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
