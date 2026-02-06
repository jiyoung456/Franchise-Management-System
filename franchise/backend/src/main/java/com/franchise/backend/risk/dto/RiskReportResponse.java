package com.franchise.backend.risk.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class RiskReportResponse {

    // 공통 메타
    @JsonProperty("store_id")
    private Integer storeId;

    @JsonProperty("snapshot_date")
    private LocalDate snapshotDate;

    @JsonProperty("risk_label")
    private Integer riskLabel;

    // 도메인 기여도 (QSC vs POS)
    @JsonProperty("qsc_domain_pct")
    private Double qscDomainPct;

    @JsonProperty("pos_domain_pct")
    private Double posDomainPct;

    // QSC 세부 기여도 (clean/service/product)
    @JsonProperty("qsc_clean_pct")
    private Double qscCleanPct;

    @JsonProperty("qsc_service_pct")
    private Double qscServicePct;

    @JsonProperty("qsc_product_pct")
    private Double qscProductPct;

    // POS 세부 기여도 (sales/aov/margin)
    @JsonProperty("pos_sales_pct")
    private Double posSalesPct;

    @JsonProperty("pos_aov_pct")
    private Double posAovPct;

    @JsonProperty("pos_margin_pct")
    private Double posMarginPct;

    // 리포트 텍스트
    @JsonProperty("comment_domain")
    private String commentDomain;

    @JsonProperty("comment_focus")
    private String commentFocus;

    @JsonProperty("detail_comment")
    private String detailComment;

    @JsonProperty("external_factor_comment")
    private String externalFactorComment;

    @JsonProperty("analysis_type")
    private String analysisType;
}
