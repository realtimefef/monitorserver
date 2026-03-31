package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_preferences")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserNotificationPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private boolean emailEnabled = true;

    @Builder.Default
    private boolean emailCritical = true;

    @Builder.Default
    private boolean emailWarning = true;

    @Builder.Default
    private boolean quietHoursEnabled = false;

    private Integer quietHoursStart;

    private Integer quietHoursEnd;

    @Builder.Default
    @Column(length = 64)
    private String timezone = "UTC";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
