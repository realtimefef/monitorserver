package com.monitorserver.service;

import com.monitorserver.dto.response.AuthResponse;
import com.monitorserver.dto.response.UserResponse;
import com.monitorserver.entity.Role;
import com.monitorserver.entity.User;
import com.monitorserver.exception.BadRequestException;
import com.monitorserver.exception.ResourceNotFoundException;
import com.monitorserver.repository.AlertRepository;
import com.monitorserver.repository.AlertRuleRepository;
import com.monitorserver.repository.AgentActivityRepository;
import com.monitorserver.repository.ApiKeyRepository;
import com.monitorserver.repository.MaintenanceWindowRepository;
import com.monitorserver.repository.MetricRepository;
import com.monitorserver.repository.NotificationRepository;
import com.monitorserver.repository.ScheduledReportRepository;
import com.monitorserver.repository.ServerRepository;
import com.monitorserver.repository.UserNotificationPreferenceRepository;
import com.monitorserver.repository.UserRepository;
import com.monitorserver.repository.UserUsageStatsRepository;
import com.monitorserver.repository.WebhookConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final ServerRepository serverRepository;
    private final AlertRepository alertRepository;
    private final AlertRuleRepository alertRuleRepository;
    private final MetricRepository metricRepository;
    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository notificationPreferenceRepository;
    private final ScheduledReportRepository scheduledReportRepository;
    private final WebhookConfigRepository webhookConfigRepository;
    private final ApiKeyRepository apiKeyRepository;
    private final MaintenanceWindowRepository maintenanceWindowRepository;
    private final AgentActivityRepository agentActivityRepository;
    private final UserUsageStatsRepository userUsageStatsRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;

    /**
     * Authenticate a user by email and password.
     * Email verification is NOT required to sign in - accounts are usable immediately
     * after registration. Only the account active status is enforced.
     * Returns a JWT token and user details on success.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Incorrect email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Incorrect email or password");
        }

        if (!user.isActive()) {
            throw new BadRequestException("This account has been deactivated");
        }

        String token = jwtService.generateToken(user);
        UserResponse userResponse = UserResponse.from(user);

        log.info("User logged in: {}", user.getEmail());
        return new AuthResponse(token, userResponse);
    }

    /**
     * Register a new user. Checks for existing email/username and creates the user
     * with an encoded password. Accounts are created pre-verified so the user can
     * sign in immediately - no confirmation email is sent and no verification
     * token is issued.
     */
    @Transactional
    public void register(String username, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An account with this email already exists");
        }
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("This username is not available");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Role.USER)
                .emailVerified(true)
                .isActive(true)
                .verificationToken(null)
                .verificationTokenExpiry(null)
                .build();

        userRepository.save(user);
        log.info("User registered (auto-verified): {}", user.getEmail());
    }

    /**
     * Legacy endpoint kept for backwards compatibility with confirmation links that
     * were mailed out before verification was removed. Accounts no longer require
     * verification, so this is idempotent and never fails for an unknown token.
     */
    @Transactional
    public void verifyEmail(String token) {
        userRepository.findByVerificationToken(token).ifPresent(user -> {
            user.setEmailVerified(true);
            user.setVerificationToken(null);
            user.setVerificationTokenExpiry(null);
            userRepository.save(user);
            log.info("Legacy verification link consumed for user: {}", user.getEmail());
        });
    }

    /**
     * Legacy endpoint kept for backwards compatibility. Verification is no longer
     * required, so this is a no-op and no email is dispatched.
     */
    @Transactional(readOnly = true)
    public void resendVerification(String email) {
        log.info("Resend verification called for {} - verification is disabled, ignoring", email);
    }

    /**
     * Initiate password reset. Silently succeeds even if the email is not found
     * to prevent email enumeration attacks.
     */
    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.info("Forgot password requested for unknown email: {}", email);
            return;
        }

        String resetToken = generateSecureToken();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
        log.info("Password reset email sent to: {}", user.getEmail());
    }

    /**
     * Reset password using a valid reset token. Token must not be expired (24h window).
     */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("This reset link is invalid or has already been used"));

        if (user.getResetTokenExpiry() != null
                && user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This reset link has expired \u2014 please request a new one");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset for user: {}", user.getEmail());
    }

    /**
     * Change password for an authenticated user. Verifies the current password first.
     */
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadRequestException("The current password you entered is incorrect");
        }

        if (currentPassword.equals(newPassword)) {
            throw new BadRequestException("Your new password must differ from the current one");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
        emailService.sendPasswordChangedEmail(user.getEmail());
    }

    /**
     * Delete a user account and all associated servers (which cascade to metrics/alerts).
     */
    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Delete all dependent records for each server owned by user
        serverRepository.findByOwnerId(userId).forEach(server -> {
            notificationRepository.deleteByServerId(server.getId());
            alertRepository.deleteByServerId(server.getId());
            alertRuleRepository.deleteByServerId(server.getId());
            metricRepository.deleteByServerId(server.getId());
            maintenanceWindowRepository.deleteByServerId(server.getId());
            agentActivityRepository.deleteByServerId(server.getId());
            serverRepository.delete(server);
        });

        // Delete user-level dependent records
        webhookConfigRepository.deleteByUserId(userId);
        apiKeyRepository.deleteByUserId(userId);
        notificationRepository.deleteByUserId(userId);
        notificationPreferenceRepository.findByUserId(userId)
                .ifPresent(notificationPreferenceRepository::delete);
        scheduledReportRepository.findByOwnerId(userId)
                .forEach(scheduledReportRepository::delete);
        userUsageStatsRepository.deleteByUserId(userId);

        userRepository.delete(user);
        log.info("Account deleted for user: {}", user.getEmail());
    }

    /**
     * Get the profile of a user by ID.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return UserResponse.from(user);
    }

    /**
     * Update the profile of a user (currently only username).
     */
    @Transactional
    public UserResponse updateProfile(Long userId, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (username != null && !username.isBlank() && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new BadRequestException("This username is not available");
            }
            user.setUsername(username);
        }

        userRepository.save(user);
        return UserResponse.from(user);
    }

    /**
     * Generate a secure token: 32 random bytes -> SHA-256 -> Base64Url encoded string.
     */
    private String generateSecureToken() {
        try {
            SecureRandom random = new SecureRandom();
            byte[] bytes = new byte[32];
            random.nextBytes(bytes);

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(bytes);

            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
