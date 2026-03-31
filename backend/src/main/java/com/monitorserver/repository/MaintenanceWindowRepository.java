package com.monitorserver.repository;

import com.monitorserver.entity.MaintenanceWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MaintenanceWindowRepository extends JpaRepository<MaintenanceWindow, Long> {

    List<MaintenanceWindow> findByServerIdOrderByStartTimeDesc(Long serverId);

    @Query("SELECT mw FROM MaintenanceWindow mw WHERE mw.server.id = :serverId " +
           "AND mw.active = true AND mw.startTime <= :now AND mw.endTime >= :now")
    List<MaintenanceWindow> findActiveForServer(@Param("serverId") Long serverId,
                                                 @Param("now") LocalDateTime now);

    java.util.Optional<MaintenanceWindow> findByIdAndServerId(Long id, Long serverId);
}
