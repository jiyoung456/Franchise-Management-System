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

    public ActionEffectResponse(Long actionId, Long storeId, String metricCode, LocalDate baseDate,
                                List<LocalDate> labels, List<BigDecimal> storeSeries,
                                List<BigDecimal> baselineSeries, BigDecimal baselineValue) {
        this.actionId = actionId;
        this.storeId = storeId;
        this.metricCode = metricCode;
        this.baseDate = baseDate;
        this.labels = labels;
        this.storeSeries = storeSeries;
        this.baselineSeries = baselineSeries;
        this.baselineValue = baselineValue;
    }

    public Long getActionId() { return actionId; }
    public Long getStoreId() { return storeId; }
    public String getMetricCode() { return metricCode; }
    public LocalDate getBaseDate() { return baseDate; }
    public List<LocalDate> getLabels() { return labels; }
    public List<BigDecimal> getStoreSeries() { return storeSeries; }
    public List<BigDecimal> getBaselineSeries() { return baselineSeries; }
    public BigDecimal getBaselineValue() { return baselineValue; }
}
