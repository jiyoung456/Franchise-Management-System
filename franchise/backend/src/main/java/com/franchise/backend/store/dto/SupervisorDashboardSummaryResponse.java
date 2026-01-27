package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class SupervisorDashboardSummaryResponse {

    // 상단 카드
    private long assignedStoreCount;     // 담당 점포 수
    private long riskStoreCount;         // 위험 점포 수
    private long recentEventCount;       // 최근 이벤트(24~48h 기준)
    private long pendingActionCount;     // 미이행 조치

    // 차트
    private List<TrendPoint> weeklyAvgRiskScoreTrend;        // 평균 위험 점수 추이(주 단위 4개)
    private List<TrendPoint> monthlyAvgSalesChangeRateTrend; // 평균 매출 변화율 추이(월 단위 4개)

    // 등급별 분포(상태 분포)
    private StateDistribution stateDistribution;

    // 방문 현황(이번 달) - 지금은 "이번 달 QSC(점검) 수행"을 방문으로 간주해서 계산
    private VisitStatus visitStatus;

    // 최근 방문 점포(최근 QSC 기준)
    private List<RecentVisitedStore> recentVisitedStores;

    @Getter
    @AllArgsConstructor
    public static class TrendPoint {
        private String label;   // "1주", "2주", "9월" 같은 라벨
        private Double value;   // 값
    }

    @Getter
    @AllArgsConstructor
    public static class StateDistribution {
        private long normalCount;
        private long watchCount;
        private long riskCount;
    }

    @Getter
    @AllArgsConstructor
    public static class VisitStatus {
        private long completedCount;     // 이번 달 방문(점검) 완료 점포 수
        private long totalCount;         // 담당 점포 수
        private int completionRatePct;   // 0~100
    }

    @Getter
    @AllArgsConstructor
    public static class RecentVisitedStore {
        private Long storeId;
        private String storeName;
        private String visitedAt; // 프론트가 바로 쓰기 쉽도록 문자열(ISO)로 내려줌
    }
}
