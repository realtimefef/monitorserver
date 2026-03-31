package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "metrics",
    indexes = {
        @Index(columnList = "server_id, timestamp"),
        @Index(columnList = "metric_type, timestamp")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "server_id", nullable = false)
    private MonitoredServer server;

    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type", nullable = false)
    private MetricType metricType;

    @Column(nullable = false)
    private Double value;

    private String unit;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();

    @Column(length = 1000)
    private String additionalInfo;
}
