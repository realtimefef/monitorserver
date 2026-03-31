package com.monitorserver.service;

import com.monitorserver.entity.*;
import com.monitorserver.repository.WebhookConfigRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class WebhookDeliveryService {

    private final WebhookConfigRepository webhookConfigRepository;
    private final RestTemplate restTemplate;

    public WebhookDeliveryService(WebhookConfigRepository webhookConfigRepository) {
        this.webhookConfigRepository = webhookConfigRepository;

        // RestTemplate with 10s connect and 10s read timeout
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(10_000);
        this.restTemplate = new RestTemplate(factory);
    }

    @Async
    public void sendAlertWebhooks(User owner, Alert alert) {
        List<WebhookConfig> webhooks = webhookConfigRepository.findByUserIdAndEnabledTrue(owner.getId());

        if (webhooks.isEmpty()) return;

        AlertSeverity severity = alert.getSeverity();

        for (WebhookConfig wh : webhooks) {
            if (severity == AlertSeverity.CRITICAL && !wh.isNotifyCritical()) continue;
            if (severity == AlertSeverity.WARNING && !wh.isNotifyWarning()) continue;
            if (severity == AlertSeverity.INFO && !wh.isNotifyInfo()) continue;

            try {
                String payload = buildPayload(wh.getType(), alert);
                sendWebhook(wh, payload);

                wh.setLastTriggeredAt(LocalDateTime.now());
                wh.setLastError(null);
                webhookConfigRepository.save(wh);

                log.info("Webhook '{}' delivered for alert {} on server '{}'",
                        wh.getName(), alert.getId(), alert.getServer().getName());
            } catch (Exception e) {
                wh.setLastError(e.getMessage());
                webhookConfigRepository.save(wh);
                log.warn("Webhook '{}' delivery failed: {}", wh.getName(), e.getMessage());
            }
        }
    }

    private void sendWebhook(WebhookConfig wh, String payload) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> request = new HttpEntity<>(payload, headers);
        restTemplate.postForEntity(wh.getUrl(), request, String.class);
    }

    private String buildPayload(WebhookType type, Alert alert) {
        String serverName = alert.getServer() != null ? alert.getServer().getName() : "Unknown";
        String title = alert.getTitle();
        String severity = alert.getSeverity().name();
        String message = alert.getMessage();
        Double value = alert.getMetricValue();
        Double threshold = alert.getThresholdValue();

        return switch (type) {
            case SLACK -> buildSlackPayload(serverName, title, severity, message, value, threshold);
            case DISCORD -> buildDiscordPayload(serverName, title, severity, message, value, threshold);
            case GENERIC -> buildGenericPayload(serverName, title, severity, message, value, threshold);
        };
    }

    private String buildSlackPayload(String server, String title, String severity,
                                      String message, Double value, Double threshold) {
        String color = switch (severity) {
            case "CRITICAL" -> "#dc2626";
            case "WARNING" -> "#f59e0b";
            default -> "#3b82f6";
        };

        return String.format("""
            {
                "attachments": [{
                    "color": "%s",
                    "blocks": [
                        {
                            "type": "header",
                            "text": {"type": "plain_text", "text": "🚨 %s Alert: %s"}
                        },
                        {
                            "type": "section",
                            "fields": [
                                {"type": "mrkdwn", "text": "*Server:*\\n%s"},
                                {"type": "mrkdwn", "text": "*Severity:*\\n%s"},
                                {"type": "mrkdwn", "text": "*Value:*\\n%.2f"},
                                {"type": "mrkdwn", "text": "*Threshold:*\\n%.2f"}
                            ]
                        },
                        {
                            "type": "section",
                            "text": {"type": "mrkdwn", "text": "%s"}
                        }
                    ]
                }]
            }""", color, severity, escapeJson(title), escapeJson(server), severity,
                value != null ? value : 0.0, threshold != null ? threshold : 0.0, escapeJson(message));
    }

    private String buildDiscordPayload(String server, String title, String severity,
                                        String message, Double value, Double threshold) {
        int color = switch (severity) {
            case "CRITICAL" -> 0xdc2626;
            case "WARNING" -> 0xf59e0b;
            default -> 0x3b82f6;
        };

        return String.format("""
            {
                "embeds": [{
                    "title": "🚨 %s Alert: %s",
                    "description": "%s",
                    "color": %d,
                    "fields": [
                        {"name": "Server", "value": "%s", "inline": true},
                        {"name": "Severity", "value": "%s", "inline": true},
                        {"name": "Value", "value": "%.2f", "inline": true},
                        {"name": "Threshold", "value": "%.2f", "inline": true}
                    ]
                }]
            }""", severity, escapeJson(title), escapeJson(message), color,
                escapeJson(server), severity,
                value != null ? value : 0.0, threshold != null ? threshold : 0.0);
    }

    private String buildGenericPayload(String server, String title, String severity,
                                        String message, Double value, Double threshold) {
        return String.format("""
            {
                "event": "alert_triggered",
                "server": "%s",
                "title": "%s",
                "severity": "%s",
                "message": "%s",
                "metricValue": %s,
                "thresholdValue": %s,
                "timestamp": "%s"
            }""", escapeJson(server), escapeJson(title), severity, escapeJson(message),
                value != null ? String.format("%.2f", value) : "null",
                threshold != null ? String.format("%.2f", threshold) : "null",
                LocalDateTime.now().toString());
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                     .replace("\"", "\\\"")
                     .replace("\n", "\\n")
                     .replace("\r", "\\r")
                     .replace("\t", "\\t");
    }
}
