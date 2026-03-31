package com.monitorserver.repository;

import com.monitorserver.entity.MonitoredServer;
import com.monitorserver.entity.ServerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServerRepository extends JpaRepository<MonitoredServer, Long> {

    List<MonitoredServer> findByOwnerId(Long ownerId);

    List<MonitoredServer> findByOwnerIdAndStatus(Long ownerId, ServerStatus status);

    Optional<MonitoredServer> findByAgentKey(String agentKey);

    Optional<MonitoredServer> findByIdAndOwnerId(Long id, Long ownerId);

    List<MonitoredServer> findByStatusAndLastHeartbeatBefore(ServerStatus status, LocalDateTime cutoff);

    @Query("SELECT s FROM MonitoredServer s WHERE s.lastHeartbeat < :cutoff AND s.status != :status")
    List<MonitoredServer> findServersWithStaleHeartbeat(
        @Param("cutoff") LocalDateTime cutoff,
        @Param("status") ServerStatus status
    );
}
