package com.monitorserver.dto.response;

import com.monitorserver.entity.ApiKey;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKeyResponse {

    private Long id;
    private String name;
    private String prefix;
    private String key;
    private boolean active;
    private LocalDateTime lastUsedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;

    public static ApiKeyResponse from(ApiKey apiKey) {
        return ApiKeyResponse.builder()
                .id(apiKey.getId())
                .name(apiKey.getName())
                .prefix(apiKey.getPrefix())
                .active(apiKey.isActive())
                .lastUsedAt(apiKey.getLastUsedAt())
                .expiresAt(apiKey.getExpiresAt())
                .createdAt(apiKey.getCreatedAt())
                .build();
    }

    public static ApiKeyResponse fromWithKey(ApiKey apiKey, String rawKey) {
        ApiKeyResponse resp = from(apiKey);
        resp.setKey(rawKey);
        return resp;
    }
}
