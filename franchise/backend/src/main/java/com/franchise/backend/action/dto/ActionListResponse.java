package com.franchise.backend.action.dto;

import java.time.LocalDate;

public class ActionListResponse {

    private Long actionId;
    private String title;
    private Long storeId;
    private String priority;
    private String status;
    private LocalDate dueDate;

    private Long assignedToUserId;
    private String assignedToUserName;

    public ActionListResponse(Long actionId, String title, Long storeId,
                              String priority, String status, LocalDate dueDate,
                              Long assignedToUserId, String assignedToUserName) {
        this.actionId = actionId;
        this.title = title;
        this.storeId = storeId;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.assignedToUserId = assignedToUserId;
        this.assignedToUserName = assignedToUserName;
    }

    public Long getActionId() { return actionId; }
    public String getTitle() { return title; }
    public Long getStoreId() { return storeId; }
    public String getPriority() { return priority; }
    public String getStatus() { return status; }
    public LocalDate getDueDate() { return dueDate; }
    public Long getAssignedToUserId() { return assignedToUserId; }
    public String getAssignedToUserName() { return assignedToUserName; }
}
