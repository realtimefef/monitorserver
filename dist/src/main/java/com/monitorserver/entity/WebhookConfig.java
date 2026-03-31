package com.monitorserver.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "webhook_configs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false, length = 2000)
    private String url;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private WebhookType type = WebhookType.GENERIC;

    @Builder.Default
    private boolean enabled = true;

    @Builder.Default
    private boolean notifyCritical = true;

    @Builder.Default
    private boolean notifyWarning = true;

    @Builder.Default
    private boolean notifyInfo = false;

    private LocalDateTime lastTriggeredAt;

    private String lastError;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
