package com.franchise.backend.notification.entity;

import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Long id;

    // notification.group_id -> notification_group.group_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private NotificationGroup group;

    // notification.event_id -> event_log.event_id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private EventLog event;

    // notification.user_id -> users.user_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "noti_type", nullable = false, length = 20)
    private NotificationType notiType; // INITIAL / REMIND / ESCALATION

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /* ===================== 생성 ===================== */

    public static Notification create(
            NotificationGroup group,
            EventLog event,
            User user,
            NotificationType notiType,
            String title,
            String body
    ) {
        Notification n = new Notification();
        n.group = group;
        n.event = event;
        n.user = user;
        n.notiType = notiType;
        n.title = title;
        n.body = body;
        n.isRead = false;
        return n;
    }

    /* ===================== 라이프사이클 ===================== */

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = com.franchise.backend.common.time.ServiceTime.nowLocal();
        }
        if (this.isRead == null) {
            this.isRead = false;
        }
    }

    /* ===================== 도메인 로직 ===================== */

    public void markAsRead() {
        if (Boolean.TRUE.equals(this.isRead)) {
            return;
        }
        this.isRead = true;
        this.readAt = LocalDateTime.now();
    }
}
