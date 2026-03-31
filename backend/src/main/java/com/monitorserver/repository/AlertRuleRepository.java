package com.monitorserver.repository;

import com.monitorserver.entity.AlertRule;
import com.monitorserver.entity.MetricType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRuleRepository extends JpaRepository<AlertRule, Long> {

    List<AlertRule> findByServerIdAndIsEnabled(Long serverId, boolean enabled);

    List<AlertRule> findByServerIdAndMetricTypeAndIsEnabledTrue(Long serverId, MetricType metricType);

    List<AlertRule> findByServerId(Long serverId);

    Optional<AlertRule> findByIdAndServerOwnerId(Long id, Long ownerId);

    List<AlertRule> findByServerOwnerIdAndIsEnabledTrue(Long ownerId);

    void deleteByServerId(Long serverId);
}
