package com.monitorserver.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    // Spring Boot auto-configuration handles JavaMailSender via spring.mail.* properties.
    // BCryptPasswordEncoder and AuthenticationManager are declared in SecurityConfig.
    // Additional application-level beans can be added here as the project grows.
}
