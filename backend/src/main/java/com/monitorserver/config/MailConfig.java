package com.monitorserver.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Explicitly configures both mail senders:
 *  - Primary (noreply@) for account emails (verification, password reset)
 *  - Alerts (alerts@) for alert notification emails
 * This avoids relying on Spring Boot auto-config which can cause sender mix-ups.
 */
@Configuration
public class MailConfig {

    // Primary sender (noreply@)
    @Value("${spring.mail.host:smtp.larksuite.com}")
    private String primaryHost;

    @Value("${spring.mail.port:587}")
    private int primaryPort;

    @Value("${spring.mail.username:noreply@monitorserver.in}")
    private String primaryUsername;

    @Value("${spring.mail.password:}")
    private String primaryPassword;

    // Alerts sender (alerts@)
    @Value("${app.mail.alerts.host:smtp.larksuite.com}")
    private String alertsHost;

    @Value("${app.mail.alerts.port:587}")
    private int alertsPort;

    @Value("${app.mail.alerts.username:alerts@monitorserver.in}")
    private String alertsUsername;

    @Value("${app.mail.alerts.password:}")
    private String alertsPassword;

    @Bean
    @Primary
    public JavaMailSender mailSender() {
        return buildSender(primaryHost, primaryPort, primaryUsername, primaryPassword);
    }

    @Bean("alertsMailSender")
    public JavaMailSender alertsMailSender() {
        return buildSender(alertsHost, alertsPort, alertsUsername, alertsPassword);
    }

    private JavaMailSenderImpl buildSender(String host, int port, String username, String password) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.transport.protocol", "smtp");

        return sender;
    }
}
