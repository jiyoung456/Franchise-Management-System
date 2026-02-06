package com.franchise.backend.risk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class RiskHistoryItemResponse {

    @JsonProperty("snapshot_date")
    private LocalDate snapshotDate;

    @JsonProperty("risk_label")
    private Integer riskLabel;

    @JsonProperty("top_metric_1")
    private String topMetric1;

    @JsonProperty("top_metric_2")
    private String topMetric2;

    @JsonProperty("top_metric_3")
    private String topMetric3;
}
