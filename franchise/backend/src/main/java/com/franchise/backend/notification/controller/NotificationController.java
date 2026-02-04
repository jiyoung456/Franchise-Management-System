package com.franchise.backend.notification.controller;

import com.franchise.backend.notification.dto.NotificationCountResponse;
import com.franchise.backend.notification.dto.NotificationResponse;
import com.franchise.backend.notification.service.NotificationService;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    // ✅ 오늘 알림 전체
    @GetMapping
    public List<NotificationResponse> getNotifications(UserPrincipal principal) {
        Long userId = principal.getUserId();
        return notificationService.getTodayNotifications(userId);
    }

    // ✅ 안 읽은 알림 수 (벨 배지)
    @GetMapping("/count")
    public NotificationCountResponse unreadCount(UserPrincipal principal) {
        Long userId = principal.getUserId();
        return notificationService.getUnreadCount(userId);
    }

    // ✅ 읽음 처리
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            UserPrincipal principal,
            @PathVariable Long notificationId
    ) {
        Long userId = principal.getUserId();
        notificationService.markAsRead(userId, notificationId);
        return ResponseEntity.noContent().build();
    }
}
