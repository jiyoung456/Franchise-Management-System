package com.franchise.backend.qsc.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QscDashboardTrendResponse {

    // ex) "2026-01"
    private String endMonth;

    // ex) 6
    private Integer months;

    private List<QscDashboardTrendRow> rows;
}
