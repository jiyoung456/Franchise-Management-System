package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminDashboardSummaryResponse {

    // =========================
    // 카드 영역
    // =========================
    private long totalStoreCount;     // 전체 가맹점 수
    private long riskStoreCount;      // 위험(RISK) 점포 수
    private long newEventCount;       // 신규 이벤트 수 (48h)
    private long pendingActionCount;  // 조치 미이행/지연 수

    // =========================
    // 위험 점포 TOP5
    // =========================
    private List<RiskStoreTopResponse> riskTopStores;

    // =========================
    // 차트 영역
    // =========================
    private List<MonthlyQscTrend> avgQscTrend;              // 평균 QSC 점수 추이
    private List<MonthlySalesChangeTrend> salesChangeTrend; // 전체 매출 변화율

    // =========================
    // 내부 DTO들
    // =========================

    @Getter
    @AllArgsConstructor
    public static class RiskStoreTopResponse {
        private Long storeId;
        private String storeName;
        private Integer riskScore; // stores.current_state_score
    }

    @Getter
    @AllArgsConstructor
    public static class MonthlyQscTrend {
        private String month;   // yyyy-MM
        private Double avgScore;
    }

    @Getter
    @AllArgsConstructor
    public static class MonthlySalesChangeTrend {
        private String month;      // yyyy-MM
        private Double changeRate; // 전월 대비 %
    }
}
