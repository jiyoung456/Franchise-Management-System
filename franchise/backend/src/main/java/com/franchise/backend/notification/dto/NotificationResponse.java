package com.franchise.backend.notification.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long notificationId;
    private String title;
    private String body;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse(Long notificationId, String title, String body, Boolean isRead, LocalDateTime createdAt) {
        this.notificationId = notificationId;
        this.title = title;
        this.body = body;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getNotificationId() { return notificationId; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
