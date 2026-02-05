package com.franchise.backend.event.entity;

import com.franchise.backend.store.entity.Store;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "event_log")
public class EventLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "event_id")
    private Long eventId;

    @Column(name = "rule_id", nullable = false)
    private Long ruleId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "assigned_to_user_id")
    private Long assignedToUserId; // nullable

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "occurred_at", nullable = false)
    private OffsetDateTime occurredAt;

    @Column(name = "severity", nullable = false)
    private String severity; // INFO/WARNING/CRITICAL

    @Column(name = "summary", nullable = false)
    private String summary;

    @Column(name = "related_entity_type")
    private String relatedEntityType; // nullable

    @Column(name = "related_entity_id")
    private Long relatedEntityId; // nullable

    @Column(name = "status", nullable = false)
    private String status; // OPEN/ACK/CLOSED

    @Column(name = "first_occurred_at", nullable = false)
    private OffsetDateTime firstOccurredAt;

    @Column(name = "last_occurrence_at", nullable = false)
    private OffsetDateTime lastOccurrenceAt;

    @Column(name = "occurrence_count", nullable = false)
    private Integer occurrenceCount;

    @Column(name = "last_notified_at")
    private OffsetDateTime lastNotifiedAt; // nullable

    public void accumulate(OffsetDateTime occurredAt) {
        this.lastOccurrenceAt = occurredAt;
        this.occurrenceCount = (this.occurrenceCount == null ? 1 : this.occurrenceCount + 1);
    }

    public void accumulateOccurrence(OffsetDateTime occurredAt) {
        this.lastOccurrenceAt = occurredAt;
        this.occurrenceCount = (this.occurrenceCount == null ? 1 : this.occurrenceCount + 1);
    }

    public static EventLog create(
            Long ruleId,
            Long storeId,
            Long assignedToUserId,     // nullable
            String eventType,
            String severity,           // INFO/WARNING/CRITICAL
            String summary,
            String relatedEntityType,  // nullable
            Long relatedEntityId,      // nullable
            OffsetDateTime occurredAt
    ) {
        EventLog e = new EventLog();

        e.ruleId = ruleId;
        e.storeId = storeId;
        e.assignedToUserId = assignedToUserId;

        e.eventType = eventType;
        e.severity = severity;
        e.summary = summary;

        e.relatedEntityType = relatedEntityType;
        e.relatedEntityId = relatedEntityId;

        // ✅ 신규는 OPEN 고정
        e.status = "OPEN";

        // 발생 시각
        e.occurredAt = occurredAt;

        // Dedup 누적용 초기값
        e.firstOccurredAt = occurredAt;
        e.lastOccurrenceAt = occurredAt;
        e.occurrenceCount = 1;

        // 알림 발송시각은 "알림 보낼 때" 업데이트하므로 null로 시작
        e.lastNotifiedAt = null;

        return e;
    }






}
