package com.monitorserver.service;

import com.monitorserver.dto.request.CreateWebhookRequest;
import com.monitorserver.dto.request.UpdateWebhookRequest;
import com.monitorserver.dto.response.WebhookConfigResponse;
import com.monitorserver.entity.User;
import com.monitorserver.entity.WebhookConfig;
import com.monitorserver.entity.WebhookType;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.WebhookConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class WebhookConfigService {

    private static final int MAX_WEBHOOKS_PER_USER = 10;

    private final WebhookConfigRepository webhookConfigRepository;

    @Transactional(readOnly = true)
    public List<WebhookConfigResponse> getByUser(Long userId) {
        return webhookConfigRepository.findByUserId(userId).stream()
                .map(WebhookConfigResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WebhookConfigResponse create(CreateWebhookRequest request, User user) {
        long count = webhookConfigRepository.findByUserId(user.getId()).size();
        if (count >= MAX_WEBHOOKS_PER_USER) {
            throw new BadRequestException("Maximum " + MAX_WEBHOOKS_PER_USER + " webhooks allowed per user");
        }

        validateUrl(request.getUrl());

        WebhookConfig webhook = WebhookConfig.builder()
                .user(user)
                .name(request.getName())
                .url(request.getUrl())
                .type(parseWebhookType(request.getType()))
                .notifyCritical(request.getNotifyCritical() != null ? request.getNotifyCritical() : true)
                .notifyWarning(request.getNotifyWarning() != null ? request.getNotifyWarning() : true)
                .notifyInfo(request.getNotifyInfo() != null ? request.getNotifyInfo() : false)
                .build();

        webhook = webhookConfigRepository.save(webhook);
        log.info("Webhook created: id={}, name='{}', user={}", webhook.getId(), webhook.getName(), user.getId());
        return WebhookConfigResponse.from(webhook);
    }

    @Transactional
    public WebhookConfigResponse update(Long webhookId, UpdateWebhookRequest request, Long userId) {
        WebhookConfig webhook = webhookConfigRepository.findByIdAndUserId(webhookId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Webhook", webhookId));

        if (request.getName() != null) webhook.setName(request.getName());
        if (request.getUrl() != null) {
            validateUrl(request.getUrl());
            webhook.setUrl(request.getUrl());
        }
        if (request.getType() != null) webhook.setType(parseWebhookType(request.getType()));
        if (request.getEnabled() != null) webhook.setEnabled(request.getEnabled());
        if (request.getNotifyCritical() != null) webhook.setNotifyCritical(request.getNotifyCritical());
        if (request.getNotifyWarning() != null) webhook.setNotifyWarning(request.getNotifyWarning());
        if (request.getNotifyInfo() != null) webhook.setNotifyInfo(request.getNotifyInfo());

        webhook = webhookConfigRepository.save(webhook);
        log.info("Webhook updated: id={}", webhook.getId());
        return WebhookConfigResponse.from(webhook);
    }

    @Transactional
    public void delete(Long webhookId, Long userId) {
        WebhookConfig webhook = webhookConfigRepository.findByIdAndUserId(webhookId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Webhook", webhookId));
        webhookConfigRepository.delete(webhook);
        log.info("Webhook deleted: id={}", webhookId);
    }

    @Transactional
    public WebhookConfigResponse test(Long webhookId, Long userId) {
        WebhookConfig webhook = webhookConfigRepository.findByIdAndUserId(webhookId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Webhook", webhookId));

        // Mark as tested — the actual test delivery happens via the controller
        return WebhookConfigResponse.from(webhook);
    }

    private WebhookType parseWebhookType(String type) {
        if (type == null || type.isBlank()) return WebhookType.GENERIC;
        try {
            return WebhookType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return WebhookType.GENERIC;
        }
    }

    private void validateUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new BadRequestException("Webhook URL is required");
        }
        if (!url.startsWith("https://")) {
            throw new BadRequestException("Webhook URL must use HTTPS");
        }
        if (url.length() > 2000) {
            throw new BadRequestException("Webhook URL must be under 2000 characters");
        }
        // SSRF protection: block internal/private network URLs
        try {
            java.net.URI uri = java.net.URI.create(url);
            String host = uri.getHost();
            if (host == null) {
                throw new BadRequestException("Invalid webhook URL: no host");
            }
            host = host.toLowerCase();
            if (host.equals("localhost") || host.equals("127.0.0.1") || host.equals("[::1]") ||
                host.equals("0.0.0.0") || host.startsWith("10.") || host.startsWith("192.168.") ||
                host.startsWith("172.16.") || host.startsWith("172.17.") || host.startsWith("172.18.") ||
                host.startsWith("172.19.") || host.startsWith("172.2") || host.startsWith("172.30.") ||
                host.startsWith("172.31.") || host.equals("169.254.169.254") || host.endsWith(".local") ||
                host.endsWith(".internal")) {
                throw new BadRequestException("Webhook URL cannot point to local or private networks");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid webhook URL");
        }
    }
}
