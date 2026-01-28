package com.franchise.backend.action.dto;

import java.time.LocalDate;

public class ActionUpdateRequest {

    private String actionType;
    private String targetMetricCode;
    private LocalDate dueDate;
    private String priority;

    private String title;
    private String description;

    public String getActionType() { return actionType; }
    public String getTargetMetricCode() { return targetMetricCode; }
    public LocalDate getDueDate() { return dueDate; }
    public String getPriority() { return priority; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
}
