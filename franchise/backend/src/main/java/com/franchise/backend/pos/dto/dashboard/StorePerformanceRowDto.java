package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class StorePerformanceRowDto {
    private Long storeId;
    private String storeName;
    private String regionCode;

    private BigDecimal sales;
    private BigDecimal marginAmount;
    private BigDecimal marginRate;   // 0.60 형태(=60%)
    private BigDecimal growthRate;   // 0.126 형태(=12.6%)
}
