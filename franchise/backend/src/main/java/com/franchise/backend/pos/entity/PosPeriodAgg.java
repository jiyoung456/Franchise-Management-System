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
@Table(
        name = "pos_period_agg",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_pos_period_agg_store_type_start",
                        columnNames = {"store_id", "period_type", "period_start"}
                )
        },
        indexes = {
                @Index(name = "idx_pos_period_agg_store_id", columnList = "store_id"),
                @Index(name = "idx_pos_period_agg_type_start", columnList = "period_type, period_start")
        }
)
public class PosPeriodAgg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pos_period_agg_id")
    private Long id;

    // FK: store_id -> stores.store_id
    @Column(name = "store_id", nullable = false)
    private Long storeId;

    // 기간 구분: 주/월
    @Enumerated(EnumType.STRING)
    @Column(name = "period_type", nullable = false, length = 10)
    private PosPeriodType periodType;

    // 기간 시작/끝
    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    // 기간 내 매출 / 주문 수 / 객단가
    @Column(name = "sales_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal salesAmount;

    @Column(name = "order_count", nullable = false)
    private Integer orderCount;

    @Column(name = "aov", nullable = false, precision = 18, scale = 2)
    private BigDecimal aov;

    // 기간 내 원가 / 마진 / 마진율
    @Column(name = "cogs_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal cogsAmount;

    @Column(name = "margin_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal marginAmount;

    // 0.6000 같은 형태로 저장(=60.00%) 권장
    @Column(name = "margin_rate", nullable = false, precision = 10, scale = 4)
    private BigDecimal marginRate;

    // 전주/전월 대비 변화율(%) 또는 비율(0.1260) 중 하나로 통일 필요
    // (프론트 표시가 +12.6%라면 보통 0.1260 또는 12.60 중 하나로 저장/계산 규칙을 정해야 함)
    @Column(name = "sales_change_rate", precision = 10, scale = 4)
    private BigDecimal salesChangeRate;

    @Column(name = "order_change_rate", precision = 10, scale = 4)
    private BigDecimal orderChangeRate;

    @Column(name = "aov_change_rate", precision = 10, scale = 4)
    private BigDecimal aovChangeRate;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public enum PosPeriodType {
        WEEK, MONTH
    }
}
