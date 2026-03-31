package com.monitorserver.repository;

import com.monitorserver.entity.UserUsageStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserUsageStatsRepository extends JpaRepository<UserUsageStats, Long> {

    Optional<UserUsageStats> findByUserId(Long userId);

    void deleteByUserId(Long userId);
}
