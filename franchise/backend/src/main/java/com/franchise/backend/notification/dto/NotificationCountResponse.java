package com.franchise.backend.notification.dto;

public class NotificationCountResponse {

    private long unreadCount;

    public NotificationCountResponse(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public long getUnreadCount() {
        return unreadCount;
    }
}
