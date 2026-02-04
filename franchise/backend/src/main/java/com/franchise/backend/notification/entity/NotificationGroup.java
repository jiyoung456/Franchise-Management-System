package com.franchise.backend.notification.entity;

import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "notification_group",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_notification_group_dedup", columnNames = {"dedup_key"})
        }
)
public class NotificationGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id")
    private Long id;

    @Column(name = "dedup_key", nullable = false, length = 200)
    private String dedupKey; // storeId:ruleId:userId 같은 형태

    // notification_group.user_id -> users.user_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // notification_group.store_id -> stores.store_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    // notification_group.rule_id -> event_rule.rule_id
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rule_id", nullable = false)
    private EventRule rule;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // OPEN / ACK / CLOSED 등

    @Column(name = "escalation_step", nullable = false)
    private Integer escalationStep; // 0:초기, 1:재알림, 2:에스컬

    @Column(name = "first_occurred_at", nullable = false)
    private OffsetDateTime firstOccurredAt;

    @Column(name = "last_occurrence_at", nullable = false)
    private OffsetDateTime lastOccurrenceAt;

    @Column(name = "last_notified_at")
    private OffsetDateTime lastNotifiedAt;

    @Column(name = "occurrence_count", nullable = false)
    private Integer occurrenceCount;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /* ===================== 생성/갱신 ===================== */

    public static NotificationGroup create(
            String dedupKey,
            User user,
            Store store,
            EventRule rule,
            OffsetDateTime occurredAt
    ) {
        NotificationGroup g = new NotificationGroup();
        g.dedupKey = dedupKey;
        g.user = user;
        g.store = store;
        g.rule = rule;

        g.status = "OPEN";
        g.escalationStep = 0;

        g.firstOccurredAt = occurredAt;
        g.lastOccurrenceAt = occurredAt;
        g.lastNotifiedAt = null;

        g.occurrenceCount = 1;
        return g;
    }

    public void accumulateOccurrence(OffsetDateTime occurredAt) {
        this.lastOccurrenceAt = occurredAt;
        this.occurrenceCount = (this.occurrenceCount == null ? 1 : this.occurrenceCount + 1);
    }

    public void markNotified(OffsetDateTime notifiedAt) {
        this.lastNotifiedAt = notifiedAt;
    }

    public void updateEscalationStep(int step) {
        this.escalationStep = step;
    }

    /* ===================== 라이프사이클 ===================== */

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;

        if (this.status == null) this.status = "OPEN";
        if (this.escalationStep == null) this.escalationStep = 0;
        if (this.occurrenceCount == null) this.occurrenceCount = 1;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
