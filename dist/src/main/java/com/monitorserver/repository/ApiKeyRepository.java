package com.monitorserver.repository;

import com.monitorserver.entity.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {

    List<ApiKey> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<ApiKey> findByPrefixAndActiveTrue(String prefix);

    Optional<ApiKey> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndActiveTrue(Long userId);
}
