package com.monitorserver.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the monitoring-agent scripts so users can download them with
 * a single curl / Invoke-WebRequest one-liner shown in the dashboard.
 *
 * <pre>
 *   GET /api/v1/agent/monitor-agent.sh   → Bash agent
 *   GET /api/v1/agent/monitor-agent.ps1  → PowerShell agent
 * </pre>
 *
 * Both endpoints are unauthenticated (added to SecurityConfig permitAll).
 */
@RestController
@RequestMapping("/api/v1/agent")
public class AgentController {

    @GetMapping(value = "/monitor-agent.sh", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<Resource> downloadBashAgent() {
        Resource resource = new ClassPathResource("agent/monitor-agent.sh");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"monitor-agent.sh\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(resource);
    }

    @GetMapping(value = "/monitor-agent.ps1", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<Resource> downloadPsAgent() {
        Resource resource = new ClassPathResource("agent/monitor-agent.ps1");
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"monitor-agent.ps1\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(resource);
    }
}
