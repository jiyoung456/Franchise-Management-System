package com.franchise.backend.action.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class ActionEffectResponse {
    private Long actionId;
    private Long storeId;
    private String metricCode;
    private LocalDate baseDate;

    private List<LocalDate> labels;          // 28일
    private List<BigDecimal> storeSeries;    // 28개 (없으면 null)
    private List<BigDecimal> baselineSeries; // 28개 (조치 전 평균 수평선)

    private BigDecimal baselineValue;        // 조치 전 평균값(표시용)

    private String storeName;            // stores.store_name
    private Long relatedEventId;         // 연관 이벤트 ID (있으면)
    private String relatedEventName;     // event_log.summary
    private Long assignedToUserId;       // 담당자 ID (있으면)
    private String assignedToUserName;   // users.user_name

    public ActionEffectResponse(
            Long actionId,
            Long storeId,
            String metricCode,
            LocalDate baseDate,
            List<LocalDate> labels,
            List<BigDecimal> storeSeries,
            List<BigDecimal> baselineSeries,
            BigDecimal baselineValue,
            String storeName,
            Long relatedEventId,
            String relatedEventName,
            Long assignedToUserId,
            String assignedToUserName
    ) {
        this.actionId = actionId;
        this.storeId = storeId;
        this.metricCode = metricCode;
        this.baseDate = baseDate;
        this.labels = labels;
        this.storeSeries = storeSeries;
        this.baselineSeries = baselineSeries;
        this.baselineValue = baselineValue;

        this.storeName = storeName;
        this.relatedEventId = relatedEventId;
        this.relatedEventName = relatedEventName;
        this.assignedToUserId = assignedToUserId;
        this.assignedToUserName = assignedToUserName;
    }

    public Long getActionId() { return actionId; }
    public Long getStoreId() { return storeId; }
    public String getMetricCode() { return metricCode; }
    public LocalDate getBaseDate() { return baseDate; }
    public List<LocalDate> getLabels() { return labels; }
    public List<BigDecimal> getStoreSeries() { return storeSeries; }
    public List<BigDecimal> getBaselineSeries() { return baselineSeries; }
    public BigDecimal getBaselineValue() { return baselineValue; }
    public String getStoreName() { return storeName; }
    public Long getRelatedEventId() { return relatedEventId; }
    public String getRelatedEventName() { return relatedEventName; }
    public Long getAssignedToUserId() { return assignedToUserId; }
    public String getAssignedToUserName() { return assignedToUserName; }
}
