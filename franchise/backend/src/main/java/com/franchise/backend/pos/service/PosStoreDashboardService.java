package com.franchise.backend.pos.service;

import com.franchise.backend.pos.dto.dashboard.detail.*;
import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import com.franchise.backend.pos.repository.PosPeriodAggRepository;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.store.service.StoreScopeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PosStoreDashboardService {

    private final StoreScopeService storeScopeService;
    private final StoreRepository storeRepository;
    private final PosPeriodAggRepository posPeriodAggRepository;

    @Transactional(readOnly = true)
    public PosStoreDashboardResponse getStoreDashboard(
            String loginId,
            Long storeId,
            PosPeriodType periodType,
            LocalDate periodStart
    ) {
        // 0) 권한 체크: SV가 접근 가능한 점포인지
        List<Long> accessibleStoreIds = storeScopeService.getAccessibleStoreIdsByLoginId(loginId);
        if (accessibleStoreIds == null || !accessibleStoreIds.contains(storeId)) {
            return empty(storeId);
        }

        // 1) periodStart normalize (WEEK=월요일, MONTH=1일)
        LocalDate anchorStart = normalizePeriodStart(periodType, periodStart);

        // 2) window: WEEK=12, MONTH=6
        int window = (periodType == PosPeriodType.WEEK) ? 12 : 6;

        // 3) 최근 N개 periodStart 리스트(오래된 -> 최신)
        List<LocalDate> periodStarts = buildPeriodStartsBackward(periodType, anchorStart, window);

        // 4) trend용 aggs 조회
        List<PosPeriodAgg> aggs = posPeriodAggRepository.findByStoreIdAndPeriodStarts(
                storeId, periodType, periodStarts
        );
        Map<LocalDate, PosPeriodAgg> aggMap = new HashMap<>();
        for (PosPeriodAgg a : aggs) {
            aggMap.put(a.getPeriodStart(), a);
        }

        // 5) KPI(현재=anchor) + 전기간 대비(전주/전월)
        LocalDate prevStart = (periodType == PosPeriodType.WEEK)
                ? anchorStart.minusWeeks(1)
                : anchorStart.minusMonths(1);

        PosPeriodAgg curAgg = posPeriodAggRepository
                .findOneByStoreIdAndPeriod(storeId, periodType, anchorStart)
                .orElse(null);

        PosPeriodAgg prevAgg = posPeriodAggRepository
                .findOneByStoreIdAndPeriod(storeId, periodType, prevStart)
                .orElse(null);

        BigDecimal curSales = nvl(curAgg != null ? curAgg.getSalesAmount() : null);
        long curOrders = (curAgg != null && curAgg.getOrderCount() != null) ? curAgg.getOrderCount() : 0L;
        BigDecimal curAov = nvl(curAgg != null ? curAgg.getAov() : null);

        BigDecimal prevSales = nvl(prevAgg != null ? prevAgg.getSalesAmount() : null);
        long prevOrders = (prevAgg != null && prevAgg.getOrderCount() != null) ? prevAgg.getOrderCount() : 0L;
        BigDecimal prevAov = nvl(prevAgg != null ? prevAgg.getAov() : null);

        BigDecimal salesChangeRate = calcChangeRate(curSales, prevSales);
        BigDecimal ordersChangeRate = calcChangeRate(BigDecimal.valueOf(curOrders), BigDecimal.valueOf(prevOrders));
        BigDecimal aovChangeRate = calcChangeRate(curAov, prevAov);

        StoreKpiDto kpi = new StoreKpiDto(
                curSales,
                curOrders,
                curAov,
                salesChangeRate,
                ordersChangeRate,
                aovChangeRate
        );

        // 6) StoreInfo
        Store store = storeRepository.findById(storeId).orElse(null);
        StoreInfoDto storeInfo = new StoreInfoDto(
                storeId,
                store != null ? store.getStoreName() : "",
                store != null ? store.getRegionCode() : "",
                store != null && store.getCurrentState() != null ? store.getCurrentState().name() : null
        );

        // 7) Trend: salesChangeRate = 직전 포인트 대비, 첫 포인트는 null
        List<StoreTrendPointDto> trend = new ArrayList<>();
        BigDecimal prevPointSales = null;

        for (LocalDate ps : periodStarts) {
            PosPeriodAgg a = aggMap.get(ps);

            BigDecimal sales = nvl(a != null ? a.getSalesAmount() : null);
            long orders = (a != null && a.getOrderCount() != null) ? a.getOrderCount() : 0L;
            BigDecimal aov = nvl(a != null ? a.getAov() : null);

            BigDecimal pointChangeRate = null;
            if (prevPointSales != null) {
                pointChangeRate = calcChangeRate(sales, prevPointSales);
            }

            trend.add(new StoreTrendPointDto(
                    ps,
                    sales,
                    orders,
                    aov,
                    pointChangeRate
            ));

            prevPointSales = sales;
        }

        return new PosStoreDashboardResponse(storeInfo, kpi, trend);
    }

    // ---------------- helpers ----------------

    private LocalDate normalizePeriodStart(PosPeriodType type, LocalDate input) {
        if (type == PosPeriodType.WEEK) {
            return input.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        return input.withDayOfMonth(1);
    }

    private List<LocalDate> buildPeriodStartsBackward(PosPeriodType type, LocalDate anchor, int window) {
        LinkedList<LocalDate> list = new LinkedList<>();
        LocalDate cur = anchor;
        for (int i = 0; i < window; i++) {
            list.addFirst(cur); // 오래된 -> 최신
            cur = (type == PosPeriodType.WEEK) ? cur.minusWeeks(1) : cur.minusMonths(1);
        }
        return list;
    }

    private BigDecimal calcChangeRate(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return null; // 전기간 값이 0이면 증감률 의미가 애매하니 null 추천
        }
        return current.subtract(previous)
                .divide(previous, 6, RoundingMode.HALF_UP);
    }

    private BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private PosStoreDashboardResponse empty(Long storeId) {
        return new PosStoreDashboardResponse(
                new StoreInfoDto(storeId, "", "", null),
                new StoreKpiDto(BigDecimal.ZERO, 0L, BigDecimal.ZERO, null, null, null),
                List.of()
        );
    }
}
