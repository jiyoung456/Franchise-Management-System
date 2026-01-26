package com.franchise.backend.notification.repository;

import com.franchise.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 유저별 오늘 알림 전체
    List<Notification> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId,
            LocalDateTime start,
            LocalDateTime end
    );

    // 안 읽은 알림 개수
    long countByUserIdAndIsReadFalse(Long userId);

    // 읽음 처리할 때: "내 알림인지" 검증 포함해서 가져오기
    Optional<Notification> findByIdAndUserId(Long notificationId, Long userId);

    // 알림 전체 개수도 필요하면 사용
    long countByUserId(Long userId);


}
