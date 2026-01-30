package com.franchise.backend.action.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "actions")
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "action_id")
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "related_event_id")
    private Long relatedEventId;

    @Column(name = "action_type", nullable = false, length = 30)
    private String actionType; // EDUCATION, VISIT, ...

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @Column(nullable = false, length = 20)
    private String status; // OPEN, IN_PROGRESS, CLOSED

    @Column(name = "target_metric_code", length = 50)
    private String targetMetricCode; // QSC_HYGIENE, POS_SALES 등

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_to_user_id")
    private Long assignedToUserId;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Action(Long storeId,
                  Long relatedEventId,
                  String actionType,
                  Long assignedToUserId,
                  String targetMetricCode,
                  java.time.LocalDate dueDate,
                  String priority,
                  String title,
                  String description,
                  Long createdByUserId) {

        this.storeId = storeId;
        this.relatedEventId = relatedEventId;
        this.actionType = actionType;
        this.assignedToUserId = assignedToUserId;
        this.targetMetricCode = targetMetricCode;
        this.dueDate = dueDate;
        this.priority = priority;
        this.title = title;
        this.description = description;

        this.status = "OPEN"; // 생성 시 기본 상태
        this.createdByUserId = createdByUserId;
    }

    public void update(String actionType,
                       String targetMetricCode,
                       java.time.LocalDate dueDate,
                       String priority,
                       String title,
                       String description) {

        this.actionType = actionType;
        this.targetMetricCode = targetMetricCode;
        this.dueDate = dueDate;
        this.priority = priority;
        this.title = title;
        this.description = description;
    }


    public void close() {
        this.status = "CLOSED";
    }
}
