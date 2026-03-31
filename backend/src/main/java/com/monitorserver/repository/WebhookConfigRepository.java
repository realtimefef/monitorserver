package com.monitorserver.repository;

import com.monitorserver.entity.WebhookConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WebhookConfigRepository extends JpaRepository<WebhookConfig, Long> {

    List<WebhookConfig> findByUserIdAndEnabledTrue(Long userId);

    List<WebhookConfig> findByUserId(Long userId);

    java.util.Optional<WebhookConfig> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);
}
