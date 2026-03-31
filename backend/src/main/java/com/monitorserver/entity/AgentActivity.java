package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "agent_activity", indexes = {
    @Index(columnList = "server_id, timestamp"),
    @Index(columnList = "server_id, event_type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AgentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private MonitoredServer server;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private AgentEventType eventType;

    @Column(name = "metrics_count")
    private int metricsCount;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "agent_version", length = 50)
    private String agentVersion;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
