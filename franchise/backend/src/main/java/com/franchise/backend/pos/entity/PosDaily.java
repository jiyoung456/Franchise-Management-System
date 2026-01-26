package com.franchise.backend.pos.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "pos_daily")
public class PosDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pos_daily_id")
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "business_date", nullable = false)
    private LocalDate businessDate;

    @Column(name = "sales_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal salesAmount;

    @Column(name = "order_count", nullable = false)
    private Integer orderCount;

    @Column(name = "cogs_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal cogsAmount;

    @Column(name = "margin_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal marginAmount;

    @Column(name = "is_missing", nullable = false)
    private Boolean isMissing;

    @Column(name = "missing_policy")
    private String missingPolicy; // ex) ZERO_FILL

    @Column(name = "is_abnormal", nullable = false)
    private Boolean isAbnormal;

    @Column(name = "abnormal_type")
    private String abnormalType; // ex) SALES_SPIKE/SALES_DROP/OPERATION_ISSUE

    @Column(name = "abnormal_reason")
    private String abnormalReason;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
