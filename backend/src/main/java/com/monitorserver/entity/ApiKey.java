package com.monitorserver.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "api_keys")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true, length = 8)
    private String prefix;

    @Column(nullable = false)
    private String keyHash;

    @Builder.Default
    private boolean active = true;

    private LocalDateTime lastUsedAt;

    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
