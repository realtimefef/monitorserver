package com.monitorserver.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "monitored_servers")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonitoredServer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false)
    private String hostAddress;

    @Column(unique = true, nullable = false)
    private String agentKey;

    private String operatingSystem;

    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ServerStatus status = ServerStatus.OFFLINE;

    private LocalDateTime lastHeartbeat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Builder.Default
    private int activeAlerts = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (agentKey == null || agentKey.isBlank()) {
            agentKey = UUID.randomUUID().toString().replace("-", "");
        }
    }
}
