package com.monitorserver.repository;

import com.monitorserver.entity.ScheduledReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReport, Long> {

    List<ScheduledReport> findByOwnerId(Long ownerId);

    List<ScheduledReport> findByEnabledTrueAndNextRunAtBefore(LocalDateTime now);

    Optional<ScheduledReport> findByIdAndOwnerId(Long id, Long ownerId);
}
