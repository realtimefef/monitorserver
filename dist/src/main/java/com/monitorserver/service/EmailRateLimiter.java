package com.monitorserver.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * In-memory email rate limiter enforcing Lark Suite SMTP limits:
 * - Global: 200 emails per 100-second window
 * - Per-sender: 450 emails per day
 * - Per-user: configurable daily alert email limit (default 50)
 */
@Service
@Slf4j
public class EmailRateLimiter {

    @Value("${app.mail.rate-limit.global-per-window:200}")
    private int globalPerWindow;

    @Value("${app.mail.rate-limit.window-seconds:100}")
    private int windowSeconds;

    @Value("${app.mail.rate-limit.daily-per-sender:450}")
    private int dailyPerSender;

    @Value("${app.mail.rate-limit.daily-per-user:50}")
    private int dailyPerUser;

    // Global sliding window
    private final AtomicInteger globalWindowCount = new AtomicInteger(0);
    private final AtomicLong globalWindowStart = new AtomicLong(System.currentTimeMillis());

    // Per-sender daily counts (key = sender email)
    private final ConcurrentHashMap<String, AtomicInteger> senderDailyCounts = new ConcurrentHashMap<>();
    private volatile LocalDate senderCountDate = LocalDate.now();

    // Per-user daily alert email counts (key = userId)
    private final ConcurrentHashMap<Long, AtomicInteger> userDailyCounts = new ConcurrentHashMap<>();
    private volatile LocalDate userCountDate = LocalDate.now();

    /**
     * Check if an email can be sent (global + sender limit).
     * Increments counters if allowed.
     *
     * @param senderAddress the "from" address being used
     * @return true if the email is allowed
     */
    public synchronized boolean tryAcquire(String senderAddress) {
        resetWindowIfExpired();
        resetDailyIfNewDay();

        // Check global window limit
        if (globalWindowCount.get() >= globalPerWindow) {
            log.warn("Global email rate limit reached ({}/{})", globalWindowCount.get(), globalPerWindow);
            return false;
        }

        // Check per-sender daily limit
        AtomicInteger senderCount = senderDailyCounts.computeIfAbsent(senderAddress, k -> new AtomicInteger(0));
        if (senderCount.get() >= dailyPerSender) {
            log.warn("Daily sender limit reached for {} ({}/{})", senderAddress, senderCount.get(), dailyPerSender);
            return false;
        }

        // Increment both counters
        globalWindowCount.incrementAndGet();
        senderCount.incrementAndGet();
        return true;
    }

    /**
     * Check if a user can receive another alert email today.
     * Does NOT increment — call {@link #recordUserAlertEmail(Long)} after sending.
     *
     * @param userId the user ID
     * @return true if allowed, false if daily limit reached
     */
    public boolean canSendAlertToUser(Long userId) {
        resetDailyIfNewDay();
        AtomicInteger count = userDailyCounts.computeIfAbsent(userId, k -> new AtomicInteger(0));
        return count.get() < dailyPerUser;
    }

    /**
     * Check if the user is exactly at the limit (for sending the "limit reached" notice).
     */
    public boolean isUserAtLimit(Long userId) {
        resetDailyIfNewDay();
        AtomicInteger count = userDailyCounts.get(userId);
        return count != null && count.get() >= dailyPerUser;
    }

    /**
     * Record that an alert email was sent to a user.
     */
    public void recordUserAlertEmail(Long userId) {
        resetDailyIfNewDay();
        userDailyCounts.computeIfAbsent(userId, k -> new AtomicInteger(0)).incrementAndGet();
    }

    /**
     * Get remaining alert emails for a user today.
     */
    public int getRemainingForUser(Long userId) {
        resetDailyIfNewDay();
        AtomicInteger count = userDailyCounts.get(userId);
        int used = count != null ? count.get() : 0;
        return Math.max(0, dailyPerUser - used);
    }

    public int getDailyPerUser() {
        return dailyPerUser;
    }

    private void resetWindowIfExpired() {
        long now = System.currentTimeMillis();
        long windowStart = globalWindowStart.get();
        if (now - windowStart > windowSeconds * 1000L) {
            globalWindowCount.set(0);
            globalWindowStart.set(now);
        }
    }

    private void resetDailyIfNewDay() {
        LocalDate today = LocalDate.now();
        if (!today.equals(senderCountDate)) {
            senderDailyCounts.clear();
            senderCountDate = today;
        }
        if (!today.equals(userCountDate)) {
            userDailyCounts.clear();
            userCountDate = today;
        }
    }

    /** Cleanup stale entries every hour. */
    @Scheduled(fixedRate = 3_600_000)
    public void cleanup() {
        resetDailyIfNewDay();
    }
}
