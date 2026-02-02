package com.franchise.backend.pos.service;

import com.franchise.backend.pos.dto.dashboard.*;
import com.franchise.backend.pos.entity.PosDaily;
import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import com.franchise.backend.pos.repository.PosDailyRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PosDashboardService {

    private final StoreScopeService storeScopeService;
    private final StoreRepository storeRepository;
    private final PosPeriodAggRepository posPeriodAggRepository;
    private final PosDailyRepository posDailyRepository;

    @Transactional(readOnly = true)
    public PosDashboardResponse getDashboard(
            String loginId,
            PosPeriodType periodType,
            LocalDate periodStart
    ) {
        // 1) SV 담당 점포 IDs
        List<Long> storeIds = storeScopeService.getAccessibleStoreIdsByLoginId(loginId);
        if (storeIds.isEmpty()) {
            return emptyResponse();
        }

        // 2) periodStart 정규화 (WEEK: 월요일 / MONTH: 1일)
        LocalDate normalizedStart = normalizePeriodStart(periodType, periodStart);

        // 3) 이번 기간 / 전 기간 시작일 계산 (정규화 기준)
        LocalDate prevPeriodStart = calculatePrevPeriodStart(periodType, normalizedStart);

        // 4) pos_period_agg 조회 (정규화 기준)
        List<PosPeriodAgg> currentAggs =
                posPeriodAggRepository.findByStoreIdsAndPeriod(storeIds, periodType, normalizedStart);

        List<PosPeriodAgg> prevAggs =
                posPeriodAggRepository.findPrevByStoreIdsAndPeriod(storeIds, periodType, prevPeriodStart);

        Map<Long, PosPeriodAgg> prevAggMap = prevAggs.stream()
                .collect(Collectors.toMap(PosPeriodAgg::getStoreId, p -> p));

        // 5) Store 정보 조회 (이름/지역)
        Map<Long, Store> storeMap = storeRepository.findAllById(storeIds).stream()
                .collect(Collectors.toMap(Store::getId, s -> s));

        // 6) 성과리스트 + KPI 계산
        BigDecimal totalSales = BigDecimal.ZERO;
        BigDecimal totalMargin = BigDecimal.ZERO;
        long totalOrders = 0;

        List<StorePerformanceRowDto> performanceList = new ArrayList<>();

        for (PosPeriodAgg cur : currentAggs) {
            totalSales = totalSales.add(cur.getSalesAmount());
            totalMargin = totalMargin.add(cur.getMarginAmount());
            totalOrders += cur.getOrderCount();

            PosPeriodAgg prev = prevAggMap.get(cur.getStoreId());
            BigDecimal growthRate = BigDecimal.ZERO;
            if (prev != null && prev.getSalesAmount().compareTo(BigDecimal.ZERO) > 0) {
                growthRate = cur.getSalesAmount()
                        .subtract(prev.getSalesAmount())
                        .divide(prev.getSalesAmount(), 4, RoundingMode.HALF_UP);
            }

            Store store = storeMap.get(cur.getStoreId());

            performanceList.add(new StorePerformanceRowDto(
                    cur.getStoreId(),
                    store != null ? store.getStoreName() : "",
                    store != null ? store.getRegionCode() : "",
                    cur.getSalesAmount(),
                    cur.getMarginAmount(),
                    cur.getMarginRate(),
                    growthRate
            ));
        }

        // 7) KPI Summary
        BigDecimal avgMarginRate = BigDecimal.ZERO;
        BigDecimal avgOrderValue = BigDecimal.ZERO;

        if (totalSales.compareTo(BigDecimal.ZERO) > 0) {
            avgMarginRate = totalMargin.divide(totalSales, 4, RoundingMode.HALF_UP);
        }
        if (totalOrders > 0) {
            avgOrderValue = totalSales.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }

        //전 기간
        BigDecimal prevTotalSales = BigDecimal.ZERO;
        BigDecimal prevTotalMargin = BigDecimal.ZERO;
        long prevTotalOrders = 0;

        for (PosPeriodAgg prev : prevAggs) {
            prevTotalSales = prevTotalSales.add(prev.getSalesAmount());
            prevTotalMargin = prevTotalMargin.add(prev.getMarginAmount());
            prevTotalOrders += prev.getOrderCount();
        }

        BigDecimal prevAvgMarginRate = BigDecimal.ZERO;
        BigDecimal prevAov = BigDecimal.ZERO;

        if (prevTotalSales.compareTo(BigDecimal.ZERO) > 0) {
            prevAvgMarginRate = prevTotalMargin.divide(prevTotalSales, 4, RoundingMode.HALF_UP);
        }
        if (prevTotalOrders > 0) {
            prevAov = prevTotalSales.divide(BigDecimal.valueOf(prevTotalOrders), 2, RoundingMode.HALF_UP);
        }

        BigDecimal salesChangeRate = calcChangeRate(totalSales, prevTotalSales);
        BigDecimal orderChangeRate = calcChangeRate(
                BigDecimal.valueOf(totalOrders),
                BigDecimal.valueOf(prevTotalOrders)
        );
        BigDecimal aovChangeRate = calcChangeRate(avgOrderValue, prevAov);

        // 마진율은 pp 변화 (전기간이 0이어도 계산 가능)
        BigDecimal marginRateChangeRate = avgMarginRate.subtract(prevAvgMarginRate);

        SummaryDto summary = new SummaryDto(
                totalSales,
                avgMarginRate,
                avgOrderValue,
                totalOrders,
                salesChangeRate,
                marginRateChangeRate,
                aovChangeRate,
                orderChangeRate
        );


        // 8) 랭킹
        List<StorePerformanceRowDto> sorted =
                performanceList.stream()
                        .sorted(Comparator.comparing(StorePerformanceRowDto::getSales).reversed())
                        .toList();

        RankingDto ranking = new RankingDto(
                sorted.stream().limit(5).toList(),
                sorted.stream().skip(Math.max(0, sorted.size() - 5)).toList()
        );

        // 9) 차트 (정규화 기준)
        LocalDate periodEnd = calculatePeriodEnd(periodType, normalizedStart);

        List<PosDaily> dailies =
                posDailyRepository.findByStoreIdsAndBusinessDateBetweenOrderByBusinessDateAsc(
                        storeIds, normalizedStart, periodEnd
                );

        Map<LocalDate, TrendPointDto> trendMap = new LinkedHashMap<>();
        for (PosDaily d : dailies) {
            trendMap.compute(d.getBusinessDate(), (date, existing) -> {
                if (existing == null) {
                    return new TrendPointDto(
                            date,
                            d.getSalesAmount(),
                            d.getMarginAmount()
                    );
                }
                return new TrendPointDto(
                        date,
                        existing.getSales().add(d.getSalesAmount()),
                        existing.getMargin().add(d.getMarginAmount())
                );
            });
        }

        List<TrendPointDto> trend = new ArrayList<>(trendMap.values());

        return new PosDashboardResponse(
                summary,
                trend,
                ranking,
                performanceList
        );
    }

    // ---------------- helper ----------------

    /**
     * WEEK: 해당 날짜가 속한 주의 월요일로 보정
     * MONTH: 해당 월의 1일로 보정
     */
    private LocalDate normalizePeriodStart(PosPeriodType type, LocalDate start) {

        if (start == null) return null;

        if (type == PosPeriodType.WEEK) {
            return start.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        }
        if (type == PosPeriodType.MONTH) {
            return start.withDayOfMonth(1);
        }
        return start;
    }

    private LocalDate calculatePrevPeriodStart(PosPeriodType type, LocalDate start) {
        return type == PosPeriodType.WEEK
                ? start.minusWeeks(1)
                : start.minusMonths(1);
    }

    private LocalDate calculatePeriodEnd(PosPeriodType type, LocalDate start) {
        return type == PosPeriodType.WEEK
                ? start.plusDays(6)
                : start.plusMonths(1).minusDays(1);
    }

    private PosDashboardResponse emptyResponse() {
        return new PosDashboardResponse(
                new SummaryDto(
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        BigDecimal.ZERO,
                        0L,
                        null,
                        null,
                        null,
                        null
                ),
                List.of(),
                new RankingDto(List.of(), List.of()),
                List.of()
        );
    }

    private BigDecimal calcChangeRate(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return null; // 전 기간 값 없으면 변화율 계산 불가
        }

        return current
                .subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP);
    }

}
