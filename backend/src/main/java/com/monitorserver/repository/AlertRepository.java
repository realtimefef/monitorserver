package com.monitorserver.repository;

import com.monitorserver.entity.Alert;
import com.monitorserver.entity.AlertStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByServerOwnerIdAndStatusNotOrderByTriggeredAtDesc(Long ownerId, AlertStatus status);

    List<Alert> findByServerIdAndStatusNotOrderByTriggeredAtDesc(Long serverId, AlertStatus status);

    List<Alert> findByServerOwnerIdAndStatusOrderByResolvedAtDesc(Long ownerId, AlertStatus status);

    List<Alert> findByServerIdOrderByTriggeredAtDesc(Long serverId, Pageable pageable);

    int countByServerIdAndStatus(Long serverId, AlertStatus status);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.server.owner.id = :ownerId AND a.status = 'ACTIVE'")
    long countActiveByOwnerId(@Param("ownerId") Long ownerId);

    Optional<Alert> findByAlertRuleIdAndStatusAndTriggeredAtAfter(
        Long ruleId,
        AlertStatus status,
        LocalDateTime since
    );

    Optional<Alert> findTopByAlertRuleIdOrderByTriggeredAtDesc(Long ruleId);

    Optional<Alert> findTopByAlertRuleIdAndStatusIn(Long ruleId, Collection<AlertStatus> statuses);

    List<Alert> findByServerOwnerIdAndStatusOrderByTriggeredAtDesc(Long ownerId, AlertStatus status);

    void deleteByServerId(Long serverId);
}
