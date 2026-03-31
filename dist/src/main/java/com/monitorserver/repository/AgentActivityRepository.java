package com.monitorserver.repository;

import com.monitorserver.entity.AgentActivity;
import com.monitorserver.entity.AgentEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AgentActivityRepository extends JpaRepository<AgentActivity, Long> {

    List<AgentActivity> findByServerIdOrderByTimestampDesc(Long serverId);

    List<AgentActivity> findByServerIdAndTimestampBetweenOrderByTimestampDesc(
            Long serverId, LocalDateTime start, LocalDateTime end);

    List<AgentActivity> findByServerIdAndEventTypeOrderByTimestampDesc(
            Long serverId, AgentEventType eventType);

    long countByServerId(Long serverId);

    long countByServerIdAndEventType(Long serverId, AgentEventType eventType);

    @Modifying
    void deleteByTimestampBefore(LocalDateTime cutoff);
}
