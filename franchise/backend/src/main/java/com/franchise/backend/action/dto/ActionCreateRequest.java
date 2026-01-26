package com.franchise.backend.action.dto;

import java.time.LocalDate;

public class ActionCreateRequest {

    // 대상 점포 (이벤트 연동)
    private Long storeId;

    // 연관 이벤트 (이벤트 연동)
    private Long relatedEventId;

    // 조치 유형 (방문 등)
    private String actionType;

    // 담당자 (자동일 수도 있지만 일단 받게 해두자)
    private Long assignedToUserId;

    // 목표 지표 (QSC 등)
    private String targetMetricCode;

    // 기한
    private LocalDate dueDate;

    // 우선순위 (HIGH 등)
    private String priority;

    // 제목
    private String title;

    // 조치 내용
    private String description;

    public Long getStoreId() { return storeId; }
    public Long getRelatedEventId() { return relatedEventId; }
    public String getActionType() { return actionType; }
    public Long getAssignedToUserId() { return assignedToUserId; }
    public String getTargetMetricCode() { return targetMetricCode; }
    public LocalDate getDueDate() { return dueDate; }
    public String getPriority() { return priority; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
}
