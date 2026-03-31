package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(columnList = "server_id, status"),
        @Index(columnList = "triggered_at")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private MonitoredServer server;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alert_rule_id")
    private AlertRule alertRule;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String message;

    private Double metricValue;

    private Double thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertSeverity severity;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlertStatus status = AlertStatus.ACTIVE;

    @Builder.Default
    @Column(name = "triggered_at", nullable = false)
    private LocalDateTime triggeredAt = LocalDateTime.now();

    private LocalDateTime acknowledgedAt;

    @Column(length = 1000)
    private String note;

    private LocalDateTime resolvedAt;
}
