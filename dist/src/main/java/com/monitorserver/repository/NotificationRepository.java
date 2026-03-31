package com.monitorserver.repository;

import com.monitorserver.entity.Notification;
import com.monitorserver.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByAlertIdOrderByCreatedAtDesc(Long alertId);

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT n FROM Notification n WHERE n.status = :status AND n.retryCount < :maxRetries")
    List<Notification> findFailedForRetry(
        @Param("status") NotificationStatus status,
        @Param("maxRetries") int maxRetries
    );

    List<Notification> findByStatus(NotificationStatus status);
}
