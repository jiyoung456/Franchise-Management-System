package com.franchise.backend.action.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ActionDetailResponse {

    private Long actionId;
    private Long storeId;
    private Long relatedEventId;

    private String actionType;
    private String title;
    private String description;

    private String priority;
    private String status;

    private String targetMetricCode;
    private LocalDate dueDate;

    private Long assignedToUserId;

    private Long createdByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String storeName;
    private String relatedEventName;
    private String assignedToUserName;

    public ActionDetailResponse(
            Long actionId,
            Long storeId,
            Long relatedEventId,
            String actionType,
            String title,
            String description,
            String priority,
            String status,
            String targetMetricCode,
            LocalDate dueDate,
            Long assignedToUserId,
            Long createdByUserId,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String storeName,
            String relatedEventName,
            String assignedToUserName
    ) {
        this.actionId = actionId;
        this.storeId = storeId;
        this.relatedEventId = relatedEventId;
        this.actionType = actionType;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.targetMetricCode = targetMetricCode;
        this.dueDate = dueDate;
        this.assignedToUserId = assignedToUserId;
        this.createdByUserId = createdByUserId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.storeName = storeName;
        this.relatedEventName = relatedEventName;
        this.assignedToUserName = assignedToUserName;
    }

    public Long getActionId() { return actionId; }
    public Long getStoreId() { return storeId; }
    public Long getRelatedEventId() { return relatedEventId; }
    public String getActionType() { return actionType; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public String getTargetMetricCode() { return targetMetricCode; }
    public LocalDate getDueDate() { return dueDate; }
    public Long getAssignedToUserId() { return assignedToUserId; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public String getStoreName() { return storeName; }
    public String getRelatedEventName() { return relatedEventName; }
    public String getAssignedToUserName() { return assignedToUserName; }
}
