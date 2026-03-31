package com.monitorserver.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Configures a second JavaMailSender for alert emails (alerts@monitorserver.in).
 * The primary sender (noreply@) is auto-configured by Spring Boot.
 */
@Configuration
public class MailConfig {

    @Value("${app.mail.alerts.host:smtp.larksuite.com}")
    private String alertsHost;

    @Value("${app.mail.alerts.port:587}")
    private int alertsPort;

    @Value("${app.mail.alerts.username:alerts@monitorserver.in}")
    private String alertsUsername;

    @Value("${app.mail.alerts.password:}")
    private String alertsPassword;

    @Bean("alertsMailSender")
    public JavaMailSender alertsMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(alertsHost);
        sender.setPort(alertsPort);
        sender.setUsername(alertsUsername);
        sender.setPassword(alertsPassword);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.transport.protocol", "smtp");

        return sender;
    }
}
