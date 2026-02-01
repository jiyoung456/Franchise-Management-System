package com.franchise.backend.pos.dto.dashboard.detail;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StoreTrendPointDto {
    private LocalDate periodStart;          // 주간이면 "월요일"
    private BigDecimal sales;
    private Long orders;
    private BigDecimal aov;

    private BigDecimal salesChangeRate;     // 직전 포인트 대비 (i=0이면 null)
}
