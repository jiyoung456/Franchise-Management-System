package com.franchise.backend.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "event_rule")
public class EventRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Long ruleId;

    @Column(name = "rule_name", nullable = false, length = 120)
    private String ruleName;

    @Column(name = "event_type", nullable = false, length = 20)
    private String eventType; // SM / QSC / POS / OPS

    @Column(name = "description", columnDefinition = "TEXT")
    private String description; // nullable

    @Column(name = "severity_default", nullable = false, length = 20)
    private String severityDefault; // INFO / WARNING / CRITICAL

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "dedup_scope", nullable = false, length = 30)
    private String dedupScope; // STORE_RULE

    @Column(name = "cooldown_days", nullable = false)
    private Integer cooldownDays;

    @Column(name = "persist_days_threshold", nullable = false)
    private Integer persistDaysThreshold;

    @Column(name = "ack_sla_days", nullable = false)
    private Integer ackSlaDays;

    @Column(name = "action_sla_days", nullable = false)
    private Integer actionSlaDays;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;

        if (this.isActive == null) this.isActive = true;

        // DB default와 맞춰서 null이면 기본값 세팅(안전)
        if (this.dedupScope == null) this.dedupScope = "STORE_RULE";
        if (this.cooldownDays == null) this.cooldownDays = 1;
        if (this.persistDaysThreshold == null) this.persistDaysThreshold = 0;
        if (this.ackSlaDays == null) this.ackSlaDays = 3;
        if (this.actionSlaDays == null) this.actionSlaDays = 7;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }
}
