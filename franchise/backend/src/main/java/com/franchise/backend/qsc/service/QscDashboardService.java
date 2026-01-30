package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.dashboard.*;
import com.franchise.backend.qsc.repository.QscDashboardProjection;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscDashboardService {

    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YM_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final QscMasterRepository qscMasterRepository;
    private final StoreRepository storeRepository;

    /**
     * 목표 완료율(기본 0.90)
     * application.yml 예:
     * qsc:
     *   dashboard:
     *     completion-target-rate: 0.9
     */
    @Value("${qsc.dashboard.completion-target-rate:0.9}")
    private double completionTargetRate;

    public QscDashboardSummaryResponse getMonthlySummary(Long svId, String month) {
        YearMonth ym = parseYearMonth(month);

        Range range = monthRangeKst(ym);
        QscDashboardProjection.Summary summary =
                qscMasterRepository.fetchMonthlySummary(svId, range.startInclusive, range.endExclusive);

        // ✅ 분모 = 담당 점포 수 * 2
        // 현재 StoreRepository에 countBySupervisor_Id가 없어서 findBySupervisor_Id로 대체(필요하면 count 메서드 추가 추천)
        long supervisorStoreCount = storeRepository.findBySupervisor_Id(svId).size();
        long plannedInspectionCount = supervisorStoreCount * 2;

        long doneInspectionCount = summary.getDoneCount() == null ? 0L : summary.getDoneCount();

        double completionRateRaw = plannedInspectionCount == 0
                ? 0.0
                : (double) doneInspectionCount / (double) plannedInspectionCount;

        // ✅ 표시 정책: 100% 캡
        double completionRateShown = Math.min(1.0, completionRateRaw);
        double delta = completionRateShown - completionTargetRate;

        return QscDashboardSummaryResponse.builder()
                .month(ym.format(YM_FMT))
                .avgScore(summary.getAvgScore()) // 점검 없으면 null 가능
                .completionRate(completionRateShown)
                .completionTargetRate(completionTargetRate)
                .completionDelta(delta)
                .riskStoreCount(nvl(summary.getRiskStoreCount()))
                .sStoreCount(nvl(summary.getSStoreCount()))
                .doneInspectionCount(doneInspectionCount)
                .plannedInspectionCount(plannedInspectionCount)
                .supervisorStoreCount(supervisorStoreCount)
                .build();
    }

    /**
     * 최근 N개월 추이 (endMonth 포함)
     * 예) months=6, endMonth=2026-01 -> 2025-08 ~ 2026-01
     */
    public QscDashboardTrendResponse getTrend(Long svId, String endMonth, int months) {
        if (months <= 0) throw new IllegalArgumentException("months must be > 0");

        YearMonth endYm = parseYearMonth(endMonth);
        YearMonth startYm = endYm.minusMonths(months - 1L);

        Range range = rangeKst(startYm, endYm);

        List<QscDashboardProjection.TrendRow> rows =
                qscMasterRepository.fetchTrend(svId, range.startInclusive, range.endExclusive);

        // DB 결과를 month 키로 맵핑
        Map<String, QscDashboardProjection.TrendRow> byMonth = rows.stream()
                .filter(r -> r.getMonth() != null)
                .collect(Collectors.toMap(QscDashboardProjection.TrendRow::getMonth, Function.identity(), (a, b) -> a));

        // ✅ 누락 월은 null로 채움 (프론트에서 빈 구간 처리 가능)
        List<QscDashboardTrendRow> filled = new ArrayList<>(months);
        YearMonth cur = startYm;
        for (int i = 0; i < months; i++) {
            String key = cur.format(YM_FMT);
            QscDashboardProjection.TrendRow r = byMonth.get(key);

            filled.add(QscDashboardTrendRow.builder()
                    .month(key)
                    .avgScore(r == null ? null : r.getAvgScore())
                    .inspectionCount(r == null ? 0L : nvl(r.getInspectionCount()))
                    .build());

            cur = cur.plusMonths(1);
        }

        return QscDashboardTrendResponse.builder()
                .endMonth(endYm.format(YM_FMT))
                .months(months)
                .rows(filled)
                .build();
    }

    /**
     * 랭킹 (month 기준, 월 내 점포별 최신 1건 기준)
     * type: "top" | "bottom"
     */
    public QscDashboardRankingResponse getRanking(Long svId, String month, String type, int limit) {
        YearMonth ym = parseYearMonth(month);
        Range range = monthRangeKst(ym);

        List<QscDashboardProjection.RankingRow> items;
        String normalizedType = normalizeType(type);

        if ("top".equals(normalizedType)) {
            items = qscMasterRepository.fetchTopRanking(svId, range.startInclusive, range.endExclusive, limit);
        } else {
            items = qscMasterRepository.fetchBottomRanking(svId, range.startInclusive, range.endExclusive, limit);
        }

        List<QscDashboardRankingItem> mapped = items.stream()
                .map(r -> QscDashboardRankingItem.builder()
                        .storeId(r.getStoreId())
                        .storeName(r.getStoreName())
                        .score(r.getScore())
                        .grade(r.getGrade())
                        .summaryComment(r.getSummaryComment())
                        .confirmedAt(r.getConfirmedAt())
                        .build())
                .toList();

        return QscDashboardRankingResponse.builder()
                .month(ym.format(YM_FMT))
                .type(normalizedType)
                .limit(limit)
                .items(mapped)
                .build();
    }

    /* =========================
       Helpers
       ========================= */

    private static YearMonth parseYearMonth(String ym) {
        try {
            return YearMonth.parse(ym, YM_FMT);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid month format. Expected yyyy-MM, got: " + ym);
        }
    }

    /** month 단위 Range: [start, nextMonthStart) (KST) */
    private static Range monthRangeKst(YearMonth ym) {
        ZonedDateTime startZdt = ym.atDay(1).atStartOfDay(KST);
        ZonedDateTime endZdt = ym.plusMonths(1).atDay(1).atStartOfDay(KST);
        return new Range(startZdt.toOffsetDateTime(), endZdt.toOffsetDateTime());
    }

    /** startYm ~ endYm 포함 범위: [startYm 1일 00:00 KST, (endYm+1) 1일 00:00 KST) */
    private static Range rangeKst(YearMonth startYm, YearMonth endYm) {
        ZonedDateTime startZdt = startYm.atDay(1).atStartOfDay(KST);
        ZonedDateTime endZdt = endYm.plusMonths(1).atDay(1).atStartOfDay(KST);
        return new Range(startZdt.toOffsetDateTime(), endZdt.toOffsetDateTime());
    }

    private static String normalizeType(String type) {
        if (type == null) return "top";
        String t = type.trim().toLowerCase(Locale.ROOT);
        return ("bottom".equals(t) ? "bottom" : "top");
    }

    private static long nvl(Long v) {
        return v == null ? 0L : v;
    }

    private record Range(OffsetDateTime startInclusive, OffsetDateTime endExclusive) {}
}
