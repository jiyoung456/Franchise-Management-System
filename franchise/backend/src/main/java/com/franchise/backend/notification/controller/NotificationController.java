package com.franchise.backend.notification.controller;

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

    @GetMapping
    public List<NotificationResponse> getNotifications() {

        //로그인 붙기 전까지 임시 유저
        Long userId = 1L;

        return notificationService.getNotifications(userId);
    }
}
