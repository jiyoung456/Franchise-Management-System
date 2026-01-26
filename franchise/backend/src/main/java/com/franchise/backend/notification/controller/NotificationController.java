package com.franchise.backend.notification.controller;

import com.franchise.backend.notification.dto.NotificationCountResponse;
import com.franchise.backend.notification.dto.NotificationResponse;
import com.franchise.backend.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // 오늘 알림 전체
    @GetMapping
    public List<NotificationResponse> getNotifications() {

        // 로그인 붙기 전 임시 유저
        Long userId = 1L;

        return notificationService.getTodayNotifications(userId);
    }

    @GetMapping("/count")
    public NotificationCountResponse unreadCount() {
        Long userId = 1L;
        return notificationService.getUnreadCount(userId);
    }

    @PostMapping("/{notificationId}/read")
    public void markAsRead(@PathVariable Long notificationId) {
        Long userId = 1L;
        notificationService.markAsRead(userId, notificationId);
    }
}
