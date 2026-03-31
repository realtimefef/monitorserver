package com.monitorserver.service;

import com.monitorserver.dto.request.UpdateNotificationPreferenceRequest;
import com.monitorserver.dto.response.NotificationPreferenceResponse;
import com.monitorserver.entity.User;
import com.monitorserver.entity.UserNotificationPreference;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.UserNotificationPreferenceRepository;
import com.monitorserver.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationPreferenceService {

    private final UserNotificationPreferenceRepository repository;
    private final UserRepository userRepository;

    /**
     * Get notification preferences for a user.
     * Creates default preferences if none exist.
     */
    @Transactional
    public NotificationPreferenceResponse get(Long userId) {
        UserNotificationPreference pref = findOrCreateDefault(userId);
        return NotificationPreferenceResponse.from(pref);
    }

    /**
     * Update notification preferences for a user.
     * Only updates fields that are non-null in the request.
     * Creates default preferences if none exist before updating.
     */
    @Transactional
    public NotificationPreferenceResponse update(Long userId, UpdateNotificationPreferenceRequest request) {
        UserNotificationPreference pref = findOrCreateDefault(userId);

        if (request.getEmailEnabled() != null) {
            pref.setEmailEnabled(request.getEmailEnabled());
        }
        if (request.getEmailCritical() != null) {
            pref.setEmailCritical(request.getEmailCritical());
        }
        if (request.getEmailWarning() != null) {
            pref.setEmailWarning(request.getEmailWarning());
        }
        if (request.getQuietHoursEnabled() != null) {
            pref.setQuietHoursEnabled(request.getQuietHoursEnabled());
        }
        if (request.getQuietHoursStart() != null) {
            pref.setQuietHoursStart(request.getQuietHoursStart());
        }
        if (request.getQuietHoursEnd() != null) {
            pref.setQuietHoursEnd(request.getQuietHoursEnd());
        }

        pref = repository.save(pref);

        log.info("Notification preferences updated for user {}", userId);

        return NotificationPreferenceResponse.from(pref);
    }

    /**
     * Find existing notification preferences for a user, or create defaults.
     * Fetches the User entity from the repository if defaults need to be created.
     */
    private UserNotificationPreference findOrCreateDefault(Long userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

                    UserNotificationPreference defaultPref = UserNotificationPreference.builder()
                            .user(user)
                            .emailEnabled(true)
                            .quietHoursEnabled(false)
                            .build();

                    defaultPref = repository.save(defaultPref);
                    log.info("Created default notification preferences for user {}", userId);
                    return defaultPref;
                });
    }
}
