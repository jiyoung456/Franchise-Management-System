package com.franchise.backend.pos.dto.dashboard.detail;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class StoreKpiDto {
    private BigDecimal totalSales;
    private Long totalOrders;
    private BigDecimal avgOrderValue;

    private BigDecimal salesChangeRate;   // 전기간 대비
    private BigDecimal ordersChangeRate;  // 전기간 대비
    private BigDecimal aovChangeRate;     // 전기간 대비
}
