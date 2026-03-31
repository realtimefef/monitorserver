package com.monitorserver.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alert_rules")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private MonitoredServer server;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetricType metricType;

    @NotNull
    @Column(nullable = false)
    private Double thresholdValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionOperator conditionOperator;

    private Integer durationSeconds;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AlertSeverity severity = AlertSeverity.WARNING;

    @Builder.Default
    @Column(name = "is_enabled")
    private boolean isEnabled = true;

    @Builder.Default
    private int cooldownMinutes = 5;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
