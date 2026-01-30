package com.franchise.backend.qsc.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QscDashboardTrendRow {

    // "YYYY-MM"
    private String month;

    // 평균 점수 (점검 0건이면 null)
    private Double avgScore;

    // 해당 월 점검 건수(분자 아님, 단순 count)
    private Long inspectionCount;
}
