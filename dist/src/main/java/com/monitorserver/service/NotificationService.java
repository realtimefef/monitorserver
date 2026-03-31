package com.monitorserver.service;

import com.monitorserver.entity.*;
import com.monitorserver.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class NotificationService {

    private static final int MAX_RETRIES = 3;

    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               @Lazy EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailService = emailService;
    }

    @Transactional
    public Notification createAndSend(Alert alert, User user, String subject, String serverName, String severity) {
        Notification notification = Notification.builder()
                .alert(alert)
                .user(user)
                .channel(NotificationChannel.EMAIL)
                .subject(subject)
                .content(String.format("Alert: %s on server %s [%s]", alert.getTitle(), serverName, severity))
                .status(NotificationStatus.PENDING)
                .build();

        notification = notificationRepository.save(notification);

        if (user.getEmail() == null || user.getEmail().isBlank()) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage("User email is null or blank");
            return notificationRepository.save(notification);
        }

        try {
            emailService.sendAlertNotification(
                    user.getEmail(),
                    serverName,
                    alert.getTitle(),
                    severity
            );
            notification.setStatus(NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            notification.setStatus(NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            log.warn("Failed to send notification {} for alert {}: {}", notification.getId(), alert.getId(), e.getMessage());
        }

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getByAlertId(Long alertId) {
        return notificationRepository.findByAlertIdOrderByCreatedAtDesc(alertId);
    }

    @Transactional(readOnly = true)
    public List<Notification> getByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void retryFailedNotifications() {
        List<Notification> failed = notificationRepository.findFailedForRetry(
                NotificationStatus.FAILED, MAX_RETRIES);

        if (failed.isEmpty()) return;

        log.info("Retrying {} failed notifications", failed.size());

        for (Notification notification : failed) {
            try {
                Alert alert = notification.getAlert();
                User user = notification.getUser();

                if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
                    notification.setStatus(NotificationStatus.FAILED);
                    notification.setErrorMessage("User or email is null");
                    notificationRepository.save(notification);
                    continue;
                }
                if (alert == null || alert.getServer() == null) {
                    notification.setStatus(NotificationStatus.FAILED);
                    notification.setErrorMessage("Alert or server data is missing");
                    notificationRepository.save(notification);
                    continue;
                }

                emailService.sendAlertNotification(
                        user.getEmail(),
                        alert.getServer().getName(),
                        alert.getTitle(),
                        alert.getSeverity().name()
                );

                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
                notification.setErrorMessage(null);
                log.info("Retry succeeded for notification {}", notification.getId());
            } catch (Exception e) {
                notification.setRetryCount(notification.getRetryCount() + 1);
                notification.setErrorMessage(e.getMessage());
                log.warn("Retry {} failed for notification {}: {}",
                        notification.getRetryCount(), notification.getId(), e.getMessage());
            }
            notificationRepository.save(notification);
        }
    }

    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processPendingNotifications() {
        List<Notification> pending = notificationRepository.findByStatus(NotificationStatus.PENDING);

        if (pending.isEmpty()) return;

        log.info("Processing {} pending notifications", pending.size());

        for (Notification notification : pending) {
            try {
                Alert alert = notification.getAlert();
                User user = notification.getUser();

                if (user == null || user.getEmail() == null || user.getEmail().isBlank()) {
                    notification.setStatus(NotificationStatus.FAILED);
                    notification.setErrorMessage("User or email is null");
                    notificationRepository.save(notification);
                    continue;
                }
                if (alert == null || alert.getServer() == null) {
                    notification.setStatus(NotificationStatus.FAILED);
                    notification.setErrorMessage("Alert or server data is missing");
                    notificationRepository.save(notification);
                    continue;
                }

                emailService.sendAlertNotification(
                        user.getEmail(),
                        alert.getServer().getName(),
                        alert.getTitle(),
                        alert.getSeverity().name()
                );

                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
            } catch (Exception e) {
                notification.setStatus(NotificationStatus.FAILED);
                notification.setErrorMessage(e.getMessage());
                log.warn("Failed to process pending notification {}: {}", notification.getId(), e.getMessage());
            }
            notificationRepository.save(notification);
        }
    }
}
