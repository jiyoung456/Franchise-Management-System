package com.franchise.backend.notification.service;

import com.franchise.backend.notification.dto.NotificationCountResponse;
import com.franchise.backend.notification.dto.NotificationResponse;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

// 테스트
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private User user;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    // 알림 목록 (삭제 X, 읽음/안읽음 모두 내려줌)
    @Transactional(readOnly = true)
    public List<NotificationResponse> getTodayNotifications(Long userId) {

        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();          // 오늘 00:00:00
        LocalDateTime end = today.plusDays(1).atStartOfDay();// 내일 00:00:00

        List<Notification> notifications =
                notificationRepository.findByUserAndCreatedAtBetweenOrderByCreatedAtDesc(
                        user, start, end
                );

        return notifications.stream()
                .map(n -> new NotificationResponse(
                        n.getId(),
                        n.getTitle(),
                        n.getBody(),
                        n.getIsRead(),
                        n.getCreatedAt()
                ))
                .toList();
    }


    // 안 읽은 알림 개수 (종 아이콘 배지)
    @Transactional(readOnly = true)
    public NotificationCountResponse getUnreadCount(Long userId) {
        long unread = notificationRepository.countByUserAndIsReadFalse(user);
        return new NotificationCountResponse(unread);
    }

    // 읽음 처리 (읽어도 목록에서 삭제 안 됨)
    @Transactional
    public void markAsRead(Long userId, Long notificationId) {

        User user = getUser(userId);

        Notification n = notificationRepository.findByIdAndUser(notificationId, user)
                .orElseThrow(() -> new IllegalArgumentException(
                        "알림이 존재하지 않거나 권한이 없습니다. notificationId=" + notificationId
                ));

        // 이미 읽음이면 그대로 (idempotent)
        if (Boolean.TRUE.equals(n.getIsRead())) {
            return;
        }

        n.markAsRead();
    }

    // ===================== 내부 유틸 =====================
    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("user not found. userId=" + userId)
                );
    }
}
