package com.franchise.backend.event.entity;

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
}
