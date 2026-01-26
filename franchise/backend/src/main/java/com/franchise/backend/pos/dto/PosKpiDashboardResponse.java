package com.franchise.backend.pos.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class PosKpiDashboardResponse {

    private Long storeId;
    private String storeName;
    private String storeState;     // NORMAL/WATCHLIST/RISK
    private String periodType;     // WEEK/MONTH

    // 좌측 카드(총매출/객단가/주문수) + 전기 대비 변화율
    private SummaryCard summary;

    // 상태 분석 요약(텍스트)
    private StatusSummary statusSummary;

    // 그래프 데이터 3종
    private List<SalesPoint> salesTrend;          // 매출 추이(라인)
    private List<RatePoint> salesChangeTrend;     // 매출 증감률 추이(라인)
    private List<OrderAovPoint> ordersAndAovTrend;// 주문수(바) & 객단가(라인)

    // 기준선(토글)
    private Baseline baseline; // baseline=false면 null 가능

    @Getter
    @AllArgsConstructor
    public static class SummaryCard {
        private Long totalSales;           // 최근 기간(마지막 주/월) 매출
        private Double totalSalesRate;     // 전기 대비 증감률(%) ex -15.0

        private Long totalOrders;          // 최근 기간 주문수
        private Double totalOrdersRate;    // 전기 대비 증감률(%)

        private Long aov;                  // 최근 기간 객단가
        private Double aovRate;            // 전기 대비 증감률(%)
    }

    @Getter
    @AllArgsConstructor
    public static class StatusSummary {
        private String title;    // ex) "최근 연속 2주 하락세"
        private String detail;   // ex) "기준선(전문가 평균) 대비 매출 15% 하락 상태가 지속..."
        private String level;    // INFO/WARN/ALERT
    }

    @Getter
    @AllArgsConstructor
    public static class SalesPoint {
        private String label;    // "1주", "2주" ... 또는 "3월"
        private Long value;      // 매출
    }

    @Getter
    @AllArgsConstructor
    public static class RatePoint {
        private String label;
        private Double value;    // 증감률(%) null 가능
    }

    @Getter
    @AllArgsConstructor
    public static class OrderAovPoint {
        private String label;
        private Long orders;     // 주문수
        private Long aov;        // 객단가
    }

    @Getter
    @AllArgsConstructor
    public static class Baseline {
        // 기준선 값(메트릭별)
        private Long salesBaseline;     // 매출 기준선
        private Long ordersBaseline;    // 주문 기준선
        private Long aovBaseline;       // 객단가 기준선

        // 경고 임계치(증감률)
        private Double salesWarnRate;   // 예: -10.0 (=-10%)
    }
}
