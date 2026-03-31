package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(columnList = "alert_id"),
        @Index(columnList = "user_id"),
        @Index(columnList = "status")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_id", nullable = false)
    private Alert alert;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationChannel channel;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private NotificationStatus status = NotificationStatus.PENDING;

    private LocalDateTime sentAt;

    @Column(length = 2000)
    private String errorMessage;

    @Builder.Default
    private int retryCount = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
