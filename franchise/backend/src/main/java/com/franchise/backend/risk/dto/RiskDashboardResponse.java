package com.franchise.backend.risk.dto;

import java.time.LocalDate;
import java.util.List;

public record RiskDashboardResponse(
        RiskDistribution distribution,          // 상단 왼쪽
        List<TopRiskFactorItem> top5Factors,     // 상단 오른쪽
        List<RiskStoreRow> stores                // 하단 테이블
) {
    public record RiskDistribution(int normal, int watchlist, int risk) {}

    public record TopRiskFactorItem(String category, long count) {}

    public record RiskStoreRow(
            Long storeId,
            String storeName,
            String status,          // NORMAL/WATCHLIST/RISK (표시용)
            String region,          // 예: "강원/충청"
            String supervisorName,  // 담당SV 이름
            Integer riskScore,      // 위험 점수
            LocalDate lastInspectedAt // 최근 점검일(QSC)
    ) {}
}
