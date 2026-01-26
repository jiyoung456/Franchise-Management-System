package com.franchise.backend.notification.service;

import com.franchise.backend.notification.dto.NotificationResponse;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationResponse> getNotifications(Long userId) {
        List<Notification> notifications =
                notificationRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);

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
}
