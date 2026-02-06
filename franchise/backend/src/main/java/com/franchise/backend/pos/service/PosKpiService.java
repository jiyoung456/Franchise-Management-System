package com.franchise.backend.pos.service;

import com.franchise.backend.pos.dto.PosKpiDashboardResponse;
import com.franchise.backend.pos.repository.PosKpiQueryRepository;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PosKpiService {

    private final StoreRepository storeRepository;
    private final PosKpiQueryRepository posKpiQueryRepository;

    @Transactional(readOnly = true)
    public PosKpiDashboardResponse getDashboard(Long storeId, String periodTypeRaw, int limit) {

        LocalDate asOf = LocalDate.of(2025, 8, 25);

        String periodType = normalizePeriodType(periodTypeRaw);
        int safeLimit = Math.max(2, Math.min(limit, 24)); // 최소 2개는 있어야 증감률 계산 의미 있음

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다. storeId=" + storeId));

        // 1) 시계열 조회 (DB는 DESC로 오니, 화면용으로 ASC로 뒤집기)
        List<Object[]> rowsDesc = periodType.equals("MONTH")
                ? posKpiQueryRepository.findMonthlySeries(storeId, safeLimit)
                : posKpiQueryRepository.findWeeklySeries(storeId, safeLimit);

        List<Object[]> rows = new ArrayList<>(rowsDesc);
        Collections.reverse(rows);

        // 2) 그래프용 포인트 생성
        List<PosKpiDashboardResponse.SalesPoint> salesTrend = new ArrayList<>();
        List<PosKpiDashboardResponse.RatePoint> salesChangeTrend = new ArrayList<>();
        List<PosKpiDashboardResponse.OrderAovPoint> ordersAndAovTrend = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Object[] r = rows.get(i);

            LocalDate periodStart = toLocalDate(r[0]);
            BigDecimal salesSum = bd(r[1]);
            BigDecimal ordersSum = bd(r[2]);
            BigDecimal aov = bd(r[3]);

            BigDecimal salesRate = (BigDecimal) r[4];   // 0.15 = +15%
            BigDecimal ordersRate = (BigDecimal) r[5];
            BigDecimal aovRate = (BigDecimal) r[6];

            String label = makeLabel(periodType, i + 1, periodStart);

            salesTrend.add(new PosKpiDashboardResponse.SalesPoint(label, salesSum.longValue()));
            salesChangeTrend.add(new PosKpiDashboardResponse.RatePoint(label, pctOrNull(salesRate)));
            ordersAndAovTrend.add(new PosKpiDashboardResponse.OrderAovPoint(
                    label,
                    ordersSum.longValue(),
                    aov.longValue()
            ));
        }

        // 3) 카드: “최근 기간” = 마지막 포인트
        PosKpiDashboardResponse.SummaryCard summaryCard = buildSummaryCard(rows);

        // 4) 상태 요약(추이 기반 간단 규칙) - baseline 제거
        PosKpiDashboardResponse.StatusSummary statusSummary = buildStatusSummary(salesChangeTrend);

        // 5) baseline 제거한 생성자 호출 (DTO도 baseline 필드 제거 필요)
        return new PosKpiDashboardResponse(
                asOf.toString(),
                store.getId(),
                store.getStoreName(),
                (store.getCurrentState() != null ? store.getCurrentState().name() : null),
                periodType,
                summaryCard,
                statusSummary,
                salesTrend,
                salesChangeTrend,
                ordersAndAovTrend
        );
    }

    private LocalDate toLocalDate(Object o) {
        if (o == null) return null;

        if (o instanceof LocalDate ld) return ld;
        if (o instanceof java.sql.Date d) return d.toLocalDate();
        if (o instanceof java.sql.Timestamp ts) return ts.toLocalDateTime().toLocalDate();
        if (o instanceof java.time.OffsetDateTime odt) return odt.toLocalDate();

        return LocalDate.parse(o.toString());
    }

    private PosKpiDashboardResponse.SummaryCard buildSummaryCard(List<Object[]> rowsAsc) {
        if (rowsAsc.isEmpty()) {
            return new PosKpiDashboardResponse.SummaryCard(0L, null, 0L, null, 0L, null);
        }

        Object[] last = rowsAsc.get(rowsAsc.size() - 1);

        BigDecimal salesSum = bd(last[1]);
        BigDecimal ordersSum = bd(last[2]);
        BigDecimal aov = bd(last[3]);

        BigDecimal salesRate = (BigDecimal) last[4];
        BigDecimal ordersRate = (BigDecimal) last[5];
        BigDecimal aovRate = (BigDecimal) last[6];

        return new PosKpiDashboardResponse.SummaryCard(
                salesSum.longValue(),
                pctOrNull(salesRate),
                ordersSum.longValue(),
                pctOrNull(ordersRate),
                aov.longValue(),
                pctOrNull(aovRate)
        );
    }

    private PosKpiDashboardResponse.StatusSummary buildStatusSummary(
            List<PosKpiDashboardResponse.RatePoint> salesChangeTrend
    ) {
        // 최근 2개가 연속 음수면 "연속 2기간 하락"
        int n = salesChangeTrend.size();
        if (n < 3) {
            return new PosKpiDashboardResponse.StatusSummary(
                    "데이터 수집 중",
                    "최근 기간 데이터가 충분하지 않아 추이를 보강 중입니다.",
                    "INFO"
            );
        }

        Double last = salesChangeTrend.get(n - 1).getValue();
        Double prev = salesChangeTrend.get(n - 2).getValue();

        if (last != null && prev != null && last < 0 && prev < 0) {
            return new PosKpiDashboardResponse.StatusSummary(
                    "최근 연속 2기간 하락세",
                    "최근 2기간 연속 하락세가 관측됩니다. 매출/주문/객단가 변화를 함께 점검하세요.",
                    "WARN"
            );
        }

        return new PosKpiDashboardResponse.StatusSummary(
                "추이 정상 범위",
                "최근 기간의 매출 변동이 기준 범위 내에서 움직이고 있습니다.",
                "INFO"
        );
    }

    private String normalizePeriodType(String raw) {
        if (raw == null) return "WEEK";
        String t = raw.trim().toUpperCase();
        if (t.equals("MONTH") || t.equals("MONTHLY")) return "MONTH";
        return "WEEK";
    }

    private String makeLabel(String periodType, int idx, LocalDate periodStart) {
        // 프론트 스샷처럼 "1주~12주" 형태로 주는 게 가장 안전
        if (periodType.equals("MONTH")) {
            return idx + "월";
        }
        return idx + "주";
    }

    private BigDecimal bd(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal b) return b;
        if (o instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
        return BigDecimal.ZERO;
    }

    private Double pctOrNull(BigDecimal rate) {
        if (rate == null) return null;
        return rate.doubleValue() * 100.0;
    }
}
