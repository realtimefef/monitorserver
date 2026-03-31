package com.monitorserver.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "scheduled_reports")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduledReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private ReportFormat format;

    private String timeframe;

    private String frequency;

    @Column(length = 2000)
    private String recipients;

    @Builder.Default
    private boolean enabled = false;

    private LocalDateTime lastGeneratedAt;

    private LocalDateTime nextRunAt;

    @ElementCollection
    @CollectionTable(name = "scheduled_report_servers", joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "server_id")
    @Builder.Default
    private Set<Long> serverIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "scheduled_report_metric_types", joinColumns = @JoinColumn(name = "report_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "metric_type")
    @Builder.Default
    private Set<MetricType> metricTypes = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
