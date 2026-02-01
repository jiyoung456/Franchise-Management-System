package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

public record SummaryDto(
        BigDecimal totalSales,
        BigDecimal avgMarginRate,
        BigDecimal avgOrderValue,
        Long totalOrders,

        BigDecimal salesChangeRate,       // 전주/전월 대비 매출 변화율
        BigDecimal marginRateChangeRate,  // 전주/전월 대비 마진율 변화율(포인트 변화)
        BigDecimal aovChangeRate,         // 전주/전월 대비 AOV 변화율
        BigDecimal orderChangeRate        // 전주/전월 대비 주문 변화율
) {}
