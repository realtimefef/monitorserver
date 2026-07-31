package com.monitorserver.service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final JavaMailSender alertsMailSender;
    private final EmailRateLimiter rateLimiter;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:noreply@nodevigil.cloud}")
    private String fromAddress;

    @Value("${app.mail.alerts.from:alerts@nodevigil.cloud}")
    private String alertsFromAddress;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender,
                        @Qualifier("alertsMailSender") JavaMailSender alertsMailSender,
                        EmailRateLimiter rateLimiter) {
        this.mailSender = mailSender;
        this.alertsMailSender = alertsMailSender;
        this.rateLimiter = rateLimiter;
    }

    /**
     * Send an email verification link to the user.
     * Retained for legacy flows \u2014 verification is no longer required at signup.
     */
    @Async
    public void sendVerificationEmail(String to, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String body = buildEmailWrapper(
                "Confirm Your Account",
                "<p style='font-size:16px;color:#374151;'>Welcome to <strong>NodeVigil</strong>! "
                + "Use the button below to confirm this email address.</p>"
                + "<div style='text-align:center;margin:28px 0;'>"
                + "<a href='" + link + "' style='display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;"
                + "text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;'>Confirm Email Address</a></div>"
                + "<p style='font-size:13px;color:#6b7280;'>Your account is already active \u2014 this step is optional. "
                + "If you did not sign up, you can safely disregard this message.</p>"
        );

        if (!mailEnabled) {
            log.warn("Email disabled \u2014 verification email not sent to: {}", to);
            return;
        }
        sendHtml(to, "Confirm Your Account \u2014 NodeVigil", body);
    }

    /**
     * Send a password reset link to the user.
     * If mail is disabled, logs the token instead.
     */
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String body = buildEmailWrapper(
                "Password Recovery",
                "<p style='font-size:16px;color:#374151;'>We received a request to reset the password "
                + "associated with this email. Use the button below to choose a new password.</p>"
                + "<div style='text-align:center;margin:28px 0;'>"
                + "<a href='" + link + "' style='display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;"
                + "text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;'>Choose New Password</a></div>"
                + "<p style='font-size:13px;color:#6b7280;'>This link expires in <strong>24 hours</strong>. "
                + "If you did not request this, no action is needed \u2014 your account remains secure.</p>"
        );

        if (!mailEnabled) {
            log.warn("Email disabled \u2014 password reset email not sent to: {}", to);
            return;
        }
        sendHtml(to, "Password Recovery \u2014 NodeVigil", body);
    }

    /**
     * Send an alert notification email via alerts@ sender.
     * Returns false if rate-limited.
     */
    @Async
    public void sendAlertNotification(String to, String serverName, String alertTitle, String severity) {
        String safeName = HtmlUtils.htmlEscape(serverName);
        String safeTitle = HtmlUtils.htmlEscape(alertTitle);
        String safeSeverity = HtmlUtils.htmlEscape(severity);
        String severityColor = "WARNING".equalsIgnoreCase(severity) ? "#f59e0b"
                : "CRITICAL".equalsIgnoreCase(severity) ? "#ef4444" : "#3b82f6";
        String body = buildEmailWrapper(
                "Infrastructure Alert",
                "<div style='border-left:4px solid " + severityColor + ";padding:12px 16px;background:#f9fafb;border-radius:4px;margin-bottom:16px;'>"
                + "<p style='margin:0 0 4px;font-weight:600;color:#111827;'>" + safeTitle + "</p>"
                + "<p style='margin:0;font-size:13px;color:#6b7280;'>Server: " + safeName
                + " &nbsp;|&nbsp; Severity: <span style='color:" + severityColor + ";font-weight:600;'>" + safeSeverity + "</span></p>"
                + "</div>"
                + "<p style='font-size:14px;color:#374151;'>Open your <strong>NodeVigil</strong> dashboard to review details and take action.</p>"
        );

        if (!mailEnabled) {
            log.warn("Email disabled, alert notification for server '{}': {} [{}]",
                    serverName, alertTitle, severity);
            return;
        }

        if (!rateLimiter.tryAcquire(alertsFromAddress)) {
            log.warn("Alert email rate-limited (global/sender limit) for '{}': {} [{}]",
                    serverName, alertTitle, severity);
            return;
        }

        sendHtml(alertsMailSender, alertsFromAddress, to,
                "[" + severity + "] " + alertTitle + " \u2014 " + serverName, body);
    }

    /**
     * Send a "daily alert limit reached" notification to a user.
     * Uses the alerts@ sender. Sent once when the user hits their daily cap.
     */
    @Async
    public void sendDailyLimitReachedEmail(String to, int dailyLimit) {
        String body = buildEmailWrapper(
                "Daily Alert Email Limit Reached",
                "<p style='font-size:16px;color:#374151;'>You have received <strong>" + dailyLimit
                + "</strong> alert emails today, which is the maximum daily limit.</p>"
                + "<p style='font-size:14px;color:#374151;'>Further alerts will still appear on your "
                + "<strong>NodeVigil</strong> dashboard and via WebSocket notifications, "
                + "but no more emails will be sent until tomorrow.</p>"
                + "<p style='font-size:13px;color:#6b7280;'>You can adjust alert rules or notification "
                + "preferences in your dashboard settings to reduce alert volume.</p>"
        );

        if (!mailEnabled) {
            log.warn("Email disabled, daily limit reached notification for: {}", to);
            return;
        }

        if (!rateLimiter.tryAcquire(alertsFromAddress)) {
            log.warn("Rate limited even for daily-limit notification to: {}", to);
            return;
        }

        sendHtml(alertsMailSender, alertsFromAddress, to,
                "Daily Alert Email Limit Reached \u2014 NodeVigil", body);
    }

    /**
     * Send a notification that the user's password was changed.
     */
    @Async
    public void sendPasswordChangedEmail(String to) {
        String body = buildEmailWrapper(
                "Password Updated",
                "<p style='font-size:16px;color:#374151;'>Your <strong>NodeVigil</strong> password "
                + "was changed successfully.</p>"
                + "<p style='font-size:13px;color:#6b7280;'>If you did not make this change, "
                + "please reset your password immediately or contact support@nodevigil.cloud.</p>"
        );

        if (!mailEnabled) {
            log.warn("Email disabled, password changed notification for: {}", to);
            return;
        }
        sendHtml(to, "Your Password Was Changed \u2014 NodeVigil", body);
    }

    /**
     * Send an infrastructure report email to multiple recipients.
     * Used by the scheduled report auto-processing.
     */
    @Async
    public void sendInfrastructureReportEmail(String[] recipients, String reportName, String htmlContent) {
        String body = buildEmailWrapper(
                "Infrastructure Report: " + HtmlUtils.htmlEscape(reportName),
                htmlContent
        );

        if (!mailEnabled) {
            log.warn("Email disabled, report '{}' not sent to {} recipients", reportName, recipients.length);
            return;
        }

        for (String to : recipients) {
            String trimmed = to.trim();
            if (trimmed.isEmpty()) continue;

            if (!rateLimiter.tryAcquire(fromAddress)) {
                log.warn("Email rate-limited for report '{}' to {}", reportName, trimmed);
                continue;
            }

            sendHtml(trimmed, "Infrastructure Report: " + reportName + " \u2014 NodeVigil", body);
        }
    }

    /**
     * Wrap email body content in a consistent branded template.
     */
    private String buildEmailWrapper(String heading, String innerHtml) {
        return "<div style='max-width:520px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;'>"
                + "<div style='border-bottom:3px solid #2563eb;padding:20px 0 12px;text-align:center;'>"
                + "<span style='font-size:20px;font-weight:700;color:#111827;'>NodeVigil</span></div>"
                + "<div style='padding:28px 4px;'>"
                + "<h2 style='margin:0 0 16px;font-size:22px;color:#111827;'>" + heading + "</h2>"
                + innerHtml
                + "</div>"
                + "<div style='border-top:1px solid #e5e7eb;padding:16px 0;text-align:center;font-size:11px;color:#9ca3af;'>"
                + "&copy; NodeVigil &mdash; Infrastructure Monitoring Platform</div></div>";
    }

    /**
     * Send an HTML email via the primary (noreply@) sender with rate limiting.
     */
    private void sendHtml(String to, String subject, String htmlBody) {
        if (!rateLimiter.tryAcquire(fromAddress)) {
            log.warn("Email rate-limited (global/sender limit) for to={} subject='{}'", to, subject);
            return;
        }
        sendHtml(mailSender, fromAddress, to, subject, htmlBody);
    }

    /**
     * Send an HTML email via specified sender. Catches MailException and logs.
     */
    private void sendHtml(JavaMailSender sender, String from, String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setFrom(from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            sender.send(msg);
            log.info("Mail dispatched from={} to={} subject='{}'", from, to, subject);
        } catch (MailException e) {
            log.error("Mail delivery failed to={}: {}", to, e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected mail error to={}: {}", to, e.getMessage());
        }
    }
}
