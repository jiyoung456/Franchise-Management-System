package com.franchise.backend.notification.repository;

import com.franchise.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 종 아이콘용: 특정 유저 최신 알림 10개
    List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}
