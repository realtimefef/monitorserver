package com.monitorserver.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory rate limiter for sensitive endpoints.
 * Limits by client IP address per sliding window.
 *
 * Protected endpoints:
 * - /api/v1/auth/login           → 10 req/min
 * - /api/v1/auth/register        → 5 req/min
 * - /api/v1/auth/forgot-password → 3 req/min
 * - /api/v1/auth/reset-password  → 5 req/min
 * - /api/v1/auth/resend-verification → 3 req/min
 * - /api/v1/metrics/ingest       → 60 req/min (agent sends every 5s = 12/min)
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RateLimitFilter extends OncePerRequestFilter {

    private record RateConfig(int maxRequests, long windowMs) {}

    private static final Map<String, RateConfig> RATE_LIMITS = Map.of(
        "/api/v1/auth/login",               new RateConfig(10, 60_000),
        "/api/v1/auth/register",             new RateConfig(5,  60_000),
        "/api/v1/auth/forgot-password",      new RateConfig(3,  60_000),
        "/api/v1/auth/reset-password",       new RateConfig(5,  60_000),
        "/api/v1/auth/resend-verification",  new RateConfig(3,  60_000),
        "/api/v1/metrics/ingest",            new RateConfig(60, 60_000),
        "/api/v1/metrics/heartbeat",         new RateConfig(60, 60_000)
    );

    private record BucketKey(String ip, String path) {}
    private record BucketEntry(AtomicInteger count, long windowStart) {}

    private final ConcurrentHashMap<BucketKey, BucketEntry> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        RateConfig config = RATE_LIMITS.get(path);

        if (config == null) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        BucketKey key = new BucketKey(clientIp, path);
        long now = System.currentTimeMillis();

        BucketEntry entry = buckets.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStart() > config.windowMs()) {
                return new BucketEntry(new AtomicInteger(1), now);
            }
            existing.count().incrementAndGet();
            return existing;
        });

        if (entry.count().get() > config.maxRequests()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests. Please try again later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    /**
     * Periodic cleanup: remove expired entries every 5 minutes
     * to prevent unbounded memory growth.
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300_000)
    public void cleanup() {
        long now = System.currentTimeMillis();
        buckets.entrySet().removeIf(e -> {
            RateConfig config = RATE_LIMITS.get(e.getKey().path());
            return config != null && now - e.getValue().windowStart() > config.windowMs() * 2;
        });
    }
}
