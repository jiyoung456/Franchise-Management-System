package com.franchise.backend.risk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "store_risk")
@Getter
@NoArgsConstructor
public class RiskReport {

    // 임시
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_risk_id")
    private Integer storeRiskId;

    @Column(name = "store_id", nullable = false)
    private Integer storeId;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    // DB 컬럼명이 risk_label_final 인 케이스
    @Column(name = "risk_label_final", nullable = false)
    private Integer riskLabelFinal;

    // ===== 상세 페이지(Top3) =====
    @Column(name = "top_metric_1")
    private String topMetric1;

    @Column(name = "top_metric_1_shap")
    private Double topMetric1Shap;

    @Column(name = "top_metric_2")
    private String topMetric2;

    @Column(name = "top_metric_2_shap")
    private Double topMetric2Shap;

    @Column(name = "top_metric_3")
    private String topMetric3;

    @Column(name = "top_metric_3_shap")
    private Double topMetric3Shap;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    // ===== 리포트용(정량 기여도) =====
    @Column(name = "qsc_domain_pct")
    private Double qscDomainPct;

    @Column(name = "pos_domain_pct")
    private Double posDomainPct;

    @Column(name = "qsc_clean_pct")
    private Double qscCleanPct;

    @Column(name = "qsc_service_pct")
    private Double qscServicePct;

    @Column(name = "qsc_product_pct")
    private Double qscProductPct;

    @Column(name = "pos_sales_pct")
    private Double posSalesPct;

    @Column(name = "pos_aov_pct")
    private Double posAovPct;

    @Column(name = "pos_margin_pct")
    private Double posMarginPct;

    // ===== 리포트용(정성 코멘트) =====
    @Column(name = "comment_domain")
    private String commentDomain;

    @Column(name = "comment_focus")
    private String commentFocus;

    @Column(name = "detail_comment", columnDefinition = "TEXT")
    private String detailComment;

    @Column(name = "external_factor_comment", columnDefinition = "TEXT")
    private String externalFactorComment;

    @Column(name = "analysis_type")
    private String analysisType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
