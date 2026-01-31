package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class SummaryDto {
    private BigDecimal totalSales;
    private BigDecimal avgMarginRate;   // 0.60 형태(=60%)
    private BigDecimal avgOrderValue;   // AOV
    private Long totalOrders;

    // 선택: 전기간 대비(화면에 필요하면 사용)
    private BigDecimal salesChangeRate; // 0.126 형태(=12.6%)
}
