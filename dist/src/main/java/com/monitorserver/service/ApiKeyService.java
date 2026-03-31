package com.monitorserver.service;

import com.monitorserver.dto.request.CreateApiKeyRequest;
import com.monitorserver.dto.response.ApiKeyResponse;
import com.monitorserver.entity.ApiKey;
import com.monitorserver.entity.User;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.ApiKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ApiKeyService {

    private static final int MAX_KEYS_PER_USER = 5;
    private static final int KEY_LENGTH = 32;
    private static final String KEY_PREFIX = "ms_";

    private final ApiKeyRepository apiKeyRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<ApiKeyResponse> getByUser(Long userId) {
        return apiKeyRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(ApiKeyResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiKeyResponse create(CreateApiKeyRequest request, User user) {
        long activeCount = apiKeyRepository.countByUserIdAndActiveTrue(user.getId());
        if (activeCount >= MAX_KEYS_PER_USER) {
            throw new BadRequestException("Maximum " + MAX_KEYS_PER_USER + " active API keys allowed");
        }

        String rawKey = generateRawKey();
        String prefix = rawKey.substring(0, 8);
        String hashed = passwordEncoder.encode(rawKey);

        LocalDateTime expiresAt = null;
        if (request.getExpiresInDays() != null && !request.getExpiresInDays().isBlank()) {
            try {
                int days = Integer.parseInt(request.getExpiresInDays());
                if (days > 0 && days <= 365) {
                    expiresAt = LocalDateTime.now().plusDays(days);
                }
            } catch (NumberFormatException ignored) {}
        }

        ApiKey apiKey = ApiKey.builder()
                .user(user)
                .name(request.getName())
                .prefix(prefix)
                .keyHash(hashed)
                .active(true)
                .expiresAt(expiresAt)
                .build();

        apiKey = apiKeyRepository.save(apiKey);
        log.info("API key created: id={}, prefix={}, user={}", apiKey.getId(), prefix, user.getId());

        return ApiKeyResponse.fromWithKey(apiKey, KEY_PREFIX + rawKey);
    }

    @Transactional
    public void revoke(Long keyId, Long userId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key", keyId));

        apiKey.setActive(false);
        apiKeyRepository.save(apiKey);
        log.info("API key revoked: id={}", keyId);
    }

    @Transactional
    public void delete(Long keyId, Long userId) {
        ApiKey apiKey = apiKeyRepository.findByIdAndUserId(keyId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("API Key", keyId));

        apiKeyRepository.delete(apiKey);
        log.info("API key deleted: id={}", keyId);
    }

    @Transactional
    public Optional<User> validateApiKey(String rawKey) {
        if (rawKey == null || rawKey.length() < 12) return Optional.empty();

        // Strip the ms_ prefix if present
        String key = rawKey.startsWith(KEY_PREFIX) ? rawKey.substring(KEY_PREFIX.length()) : rawKey;
        if (key.length() < 8) return Optional.empty();

        String prefix = key.substring(0, 8);

        Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByPrefixAndActiveTrue(prefix);
        if (apiKeyOpt.isEmpty()) return Optional.empty();

        ApiKey apiKey = apiKeyOpt.get();

        // Check expiration
        if (apiKey.getExpiresAt() != null && apiKey.getExpiresAt().isBefore(LocalDateTime.now())) {
            apiKey.setActive(false);
            apiKeyRepository.save(apiKey);
            return Optional.empty();
        }

        // Verify the key hash
        if (!passwordEncoder.matches(key, apiKey.getKeyHash())) {
            return Optional.empty();
        }

        // Update last used
        apiKey.setLastUsedAt(LocalDateTime.now());
        apiKeyRepository.save(apiKey);

        return Optional.of(apiKey.getUser());
    }

    private String generateRawKey() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[KEY_LENGTH];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
