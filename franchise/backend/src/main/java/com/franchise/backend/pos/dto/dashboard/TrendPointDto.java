package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class TrendPointDto {
    private LocalDate date;
    private BigDecimal sales;
    private BigDecimal margin; // 필요하면 marginRate로 바꿔도 됨
}
