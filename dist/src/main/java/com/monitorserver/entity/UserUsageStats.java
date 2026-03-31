package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_usage_stats", indexes = {
    @Index(columnList = "user_id"),
    @Index(columnList = "last_active_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUsageStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(name = "total_servers")
    private int totalServers = 0;

    @Builder.Default
    @Column(name = "active_servers")
    private int activeServers = 0;

    @Builder.Default
    @Column(name = "total_metrics_received")
    private long totalMetricsReceived = 0;

    @Builder.Default
    @Column(name = "total_alerts_triggered")
    private long totalAlertsTriggered = 0;

    @Builder.Default
    @Column(name = "total_agent_requests")
    private long totalAgentRequests = 0;

    @Builder.Default
    @Column(name = "total_api_requests")
    private long totalApiRequests = 0;

    @Column(name = "last_active_at")
    private LocalDateTime lastActiveAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
