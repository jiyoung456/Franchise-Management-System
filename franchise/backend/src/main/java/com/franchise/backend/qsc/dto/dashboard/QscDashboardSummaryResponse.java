package com.franchise.backend.qsc.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QscDashboardSummaryResponse {

    // ex) "2026-01"
    private String month;

    // 평균 QSC 점수 (null 가능: 점검이 없으면)
    private Double avgScore;

    // 완료율 (0.0 ~ 1.0)  ※표시는 service에서 min(1.0, raw) 적용
    private Double completionRate;

    // 목표 완료율 (예: 0.90) - 지금은 고정값으로 가도 됨
    private Double completionTargetRate;

    // completionRate - completionTargetRate (예: -0.47)
    private Double completionDelta;

    // 위험 점포 수 (C, D) - 월 내 점포별 최신 1건 기준
    private Long riskStoreCount;

    // S 등급 점포 수 - 월 내 점포별 최신 1건 기준
    private Long sStoreCount;

    // 완료율 분자/분모도 화면/디버깅에 유용하면 같이 제공
    private Long doneInspectionCount;     // 분자
    private Long plannedInspectionCount;  // 분모 (storeCount*2)

    private Long supervisorStoreCount;    // storeCount
}
