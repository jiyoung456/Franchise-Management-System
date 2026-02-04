package com.franchise.backend.notification.repository;

import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 유저별 기간 내 알림 조회 (오른쪽 상단 리스트)
    List<Notification> findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
            User user,
            LocalDateTime start,
            LocalDateTime end
    );

    // 안 읽은 알림 개수 (벨 뱃지)
    long countByUserAndIsReadFalse(User user);

    // 읽음 처리 시: 내 알림인지 검증
    Optional<Notification> findByIdAndUser(Long notificationId, User user);

    // 전체 알림 개수
    long countByUser(User user);
}
