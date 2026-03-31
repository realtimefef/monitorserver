package com.monitorserver.repository;

import com.monitorserver.entity.Metric;
import com.monitorserver.entity.MetricType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {

    List<Metric> findByServerIdAndMetricTypeAndTimestampBetweenOrderByTimestampAsc(
        Long serverId,
        MetricType type,
        LocalDateTime start,
        LocalDateTime end
    );

    Optional<Metric> findFirstByServerIdAndMetricTypeOrderByTimestampDesc(
        Long serverId,
        MetricType type
    );

    List<Metric> findByServerIdOrderByTimestampDesc(Long serverId);

    @Query("""
        SELECT m FROM Metric m
        WHERE m.server.id = :serverId
          AND m.timestamp = (
              SELECT MAX(m2.timestamp) FROM Metric m2
              WHERE m2.server.id = :serverId
                AND m2.metricType = m.metricType
          )
        """)
    List<Metric> findLatestPerTypeByServerId(@Param("serverId") Long serverId);

    @Query("""
        SELECT AVG(m.value) FROM Metric m
        WHERE m.server.id = :serverId
          AND m.metricType = :type
          AND m.timestamp >= :since
        """)
    Double findAverageValue(
        @Param("serverId") Long serverId,
        @Param("type") MetricType type,
        @Param("since") LocalDateTime since
    );

    List<Metric> findByServerIdAndTimestampBetweenOrderByTimestampAsc(
        Long serverId,
        LocalDateTime start,
        LocalDateTime end
    );

    @Modifying
    void deleteByServerId(Long serverId);

    @Modifying
    void deleteByTimestampBefore(LocalDateTime cutoff);
}
