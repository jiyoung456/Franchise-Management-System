package com.franchise.backend.notification.repository;

import com.franchise.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 특정 유저 알림 최신순 목록
    List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    // 안읽은 개수
    long countByUserIdAndIsReadFalse(Long userId);
}
