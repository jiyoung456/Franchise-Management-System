package com.franchise.backend.store.service;

import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.dto.SupervisorDashboardSummaryResponse;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StoreRepository storeRepository;
    private final EventLogRepository eventLogRepository; // 기존 팀장 summary에서 사용하던 것 유지
    private final QscMasterRepository qscMasterRepository;
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    // 팀장 홈 대시보드 상단 카드
    public DashboardSummaryResponse getSummary() {

        long riskCount = storeRepository.countByCurrentState(StoreState.RISK);

        OffsetDateTime since48h = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);
        long newEventCount = eventLogRepository.countNewEventsSince(since48h);

        long managementGapCount = 0;

        return new DashboardSummaryResponse(riskCount, newEventCount, managementGapCount);
    }

    // 팀장 홈 점포 검색 / 필터 / 정렬
    public List<StoreListResponse> getStores(StoreSearchRequest condition) {

        // 안전한 limit
        int safeLimit = normalizeLimit(condition.getLimit());

        // DB에서 상태/키워드로 후보 조회
        List<Store> stores = storeRepository.searchStores(
                condition.getState(),
                normalizeKeyword(condition.getKeyword())
        );

        // storeIds
        List<Long> storeIds = stores.stream()
                .map(Store::getId)
                .toList();

        // 점포별 최신 COMPLETED QSC 가져오기
        Map<Long, QscMaster> latestQscMap = storeIds.isEmpty()
                ? Map.of()
                : qscMasterRepository.findLatestCompletedByStoreIds(storeIds)
                .stream()
                .collect(Collectors.toMap(
                        QscMaster::getStoreId,
                        q -> q,
                        (a, b) -> {
                            if (a.getInspectedAt() == null) return b;
                            if (b.getInspectedAt() == null) return a;
                            return a.getInspectedAt().isAfter(b.getInspectedAt()) ? a : b;
                        }
                ));

        // StoreListResponse로 변환
        List<StoreListResponse> rows = stores.stream()
                .map(s -> {
                    QscMaster q = latestQscMap.get(s.getId());

                    Integer qscScore = (q != null ? q.getTotalScore() : 0);
                    LocalDate lastInspectionDate =
                            (q != null && q.getInspectedAt() != null)
                                    ? q.getInspectedAt().toLocalDate()
                                    : null;

                    return new StoreListResponse(
                            s.getId(),
                            s.getStoreName(),
                            s.getCurrentState().name(),
                            s.getRegionCode(),
                            (s.getSupervisor() != null ? s.getSupervisor().getLoginId() : "-"),
                            qscScore,
                            lastInspectionDate
                    );
                })
                .collect(Collectors.toList());

        // 정렬
        StoreSort sort = normalizeSort(condition.getSort());
        rows.sort(sort.getComparator());

        // limit 적용
        if (rows.size() > safeLimit) {
            return rows.subList(0, safeLimit);
        }
        return rows;
    }


    // SV 홈 대시보드
    public SupervisorDashboardSummaryResponse getSupervisorSummary(String supervisorLoginId) {

        String loginId = (supervisorLoginId == null ? null : supervisorLoginId.trim());
        if (loginId == null || loginId.isBlank()) {
            // 프론트가 loginId를 못 넘기면, 일단 빈 데이터
            return emptySupervisorSummary();
        }

        // 1) SV 담당 점포
        List<Store> stores = storeRepository.findBySupervisorLoginId(loginId);
        List<Long> storeIds = stores.stream().map(Store::getId).toList();

        long assignedStoreCount = stores.size();
        long riskStoreCount = stores.stream().filter(s -> s.getCurrentState() == StoreState.RISK).count();

        // 2) 최근 이벤트(48h) - event_log 테이블 native count
        long recentEventCount = countRecentEvents48h(storeIds);

        // 3) 미이행 조치 - actions 테이블 native count
        long pendingActionCount = countPendingActions(storeIds);

        // 4) 등급(상태) 분포
        long normal = stores.stream().filter(s -> s.getCurrentState() == StoreState.NORMAL).count();
        long watch = stores.stream().filter(s -> s.getCurrentState() == StoreState.WATCHLIST).count();
        long risk = riskStoreCount;

        SupervisorDashboardSummaryResponse.StateDistribution dist =
                new SupervisorDashboardSummaryResponse.StateDistribution(normal, watch, risk);

        // 5) 평균 위험 점수 추이(최근 4주) - 현재는 stores.current_state_score 평균을 4주 라벨로 내려줌
        //    (추후 risk_score_history 테이블 붙이면 주차별 실제 추이로 바꾸면 됨)
        double avgRiskScore = stores.stream()
                .map(Store::getCurrentStateScore)
                .filter(Objects::nonNull)
                .mapToInt(Integer::intValue)
                .average()
                .orElse(0.0);

        List<SupervisorDashboardSummaryResponse.TrendPoint> weeklyRiskTrend = List.of(
                new SupervisorDashboardSummaryResponse.TrendPoint("1주", avgRiskScore),
                new SupervisorDashboardSummaryResponse.TrendPoint("2주", avgRiskScore),
                new SupervisorDashboardSummaryResponse.TrendPoint("3주", avgRiskScore),
                new SupervisorDashboardSummaryResponse.TrendPoint("4주", avgRiskScore)
        );

        // 6) 평균 매출 변화율 추이(최근 4개월) - pos_daily 기반 (실패 시 0으로 방어)
        List<SupervisorDashboardSummaryResponse.TrendPoint> monthlySalesTrend =
                getMonthlyAvgSalesChangeRateTrend(storeIds);

        // 7) 방문 현황(이번 달): "이번 달 QSC COMPLETED"가 1건 이상 있으면 방문 완료로 간주
        VisitAgg visitAgg = getVisitStatusByQscThisMonth(storeIds);
        int rate = (visitAgg.total == 0) ? 0 : (int) Math.round((visitAgg.completed * 100.0) / visitAgg.total);

        SupervisorDashboardSummaryResponse.VisitStatus visitStatus =
                new SupervisorDashboardSummaryResponse.VisitStatus(
                        visitAgg.completed,
                        visitAgg.total,
                        Math.max(0, Math.min(rate, 100))
                );

        // 8) 최근 방문 점포(최근 QSC 기준)
        List<SupervisorDashboardSummaryResponse.RecentVisitedStore> recentVisitedStores =
                getRecentVisitedStoresByLatestQsc(storeIds, stores, 5);

        return new SupervisorDashboardSummaryResponse(
                assignedStoreCount,
                riskStoreCount,
                recentEventCount,
                pendingActionCount,
                weeklyRiskTrend,
                monthlySalesTrend,
                dist,
                visitStatus,
                recentVisitedStores
        );
    }

    private SupervisorDashboardSummaryResponse emptySupervisorSummary() {
        return new SupervisorDashboardSummaryResponse(
                0, 0, 0, 0,
                List.of(
                        new SupervisorDashboardSummaryResponse.TrendPoint("1주", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("2주", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("3주", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("4주", 0.0)
                ),
                List.of(
                        new SupervisorDashboardSummaryResponse.TrendPoint("7월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("8월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("9월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("10월", 0.0)
                ),
                new SupervisorDashboardSummaryResponse.StateDistribution(0, 0, 0),
                new SupervisorDashboardSummaryResponse.VisitStatus(0, 0, 0),
                List.of()
        );
    }

    private long countRecentEvents48h(List<Long> storeIds) {
        if (storeIds == null || storeIds.isEmpty()) return 0;

        OffsetDateTime since48h = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);

        String sql = """
            SELECT COUNT(*)
            FROM event_log
            WHERE store_id IN (:storeIds)
              AND occurred_at >= :since
        """;

        try {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("storeIds", storeIds)
                    .addValue("since", since48h);

            Long v = namedParameterJdbcTemplate.queryForObject(sql, params, Long.class);
            return (v == null ? 0 : v);
        } catch (DataAccessException e) {
            // 테이블/컬럼이 다르거나 아직 없을 때 서버 죽지 않게 방어
            return 0;
        }
    }

    private long countPendingActions(List<Long> storeIds) {
        if (storeIds == null || storeIds.isEmpty()) return 0;

        // actions 테이블 컬럼명이 프로젝트마다 다를 수 있어서 try/catch 방어
        // 기본 가정:
        // - actions.store_id
        // - actions.status (OPEN/IN_PROGRESS/CLOSED/OVERDUE 등)
        String sql = """
            SELECT COUNT(*)
            FROM actions
            WHERE store_id IN (:storeIds)
              AND status <> 'CLOSED'
        """;

        try {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("storeIds", storeIds);
            Long v = namedParameterJdbcTemplate.queryForObject(sql, params, Long.class);
            return (v == null ? 0 : v);
        } catch (DataAccessException e) {
            return 0;
        }
    }

    private List<SupervisorDashboardSummaryResponse.TrendPoint> getMonthlyAvgSalesChangeRateTrend(List<Long> storeIds) {
        // 최근 4개월 (이번달 포함) 기준으로 평균 매출 변화율을 계산
        // - pos_daily: store_id, sales_date, sales_amount 가 있다고 가정
        // - 월 매출합(전체 store 평균) 구하고, 전월 대비 변화율(%) 계산
        if (storeIds == null || storeIds.isEmpty()) {
            return List.of(
                    new SupervisorDashboardSummaryResponse.TrendPoint("7월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("8월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("9월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("10월", 0.0)
            );
        }

        // label 4개 생성: (현재월 기준 -3 ~ 현재월)
        YearMonth nowYm = YearMonth.now();
        List<YearMonth> yms = List.of(
                nowYm.minusMonths(3),
                nowYm.minusMonths(2),
                nowYm.minusMonths(1),
                nowYm
        );

        // 월별 총매출
        Map<YearMonth, Double> monthlySales = new LinkedHashMap<>();
        for (YearMonth ym : yms) {
            double total = sumMonthlySales(storeIds, ym);
            monthlySales.put(ym, total);
        }

        // 변화율(전월 대비) : 첫 달은 0 처리
        List<SupervisorDashboardSummaryResponse.TrendPoint> points = new ArrayList<>();
        Double prev = null;

        for (Map.Entry<YearMonth, Double> e : monthlySales.entrySet()) {
            YearMonth ym = e.getKey();
            Double cur = e.getValue();

            double ratePct = 0.0;
            if (prev != null && prev > 0) {
                ratePct = ((cur - prev) / prev) * 100.0;
            }

            String label = ym.getMonthValue() + "월";
            points.add(new SupervisorDashboardSummaryResponse.TrendPoint(label, ratePct));
            prev = cur;
        }

        return points;
    }

    private double sumMonthlySales(List<Long> storeIds, YearMonth ym) {
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        // pos_daily 컬럼명은 프로젝트마다 다를 수 있으니 try/catch 방어
        String sql = """
            SELECT COALESCE(SUM(sales_amount), 0)
            FROM pos_daily
            WHERE store_id IN (:storeIds)
              AND sales_date >= :startDate
              AND sales_date <= :endDate
        """;

        try {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("storeIds", storeIds)
                    .addValue("startDate", start)
                    .addValue("endDate", end);

            Double v = namedParameterJdbcTemplate.queryForObject(sql, params, Double.class);
            return (v == null ? 0.0 : v);
        } catch (DataAccessException e) {
            return 0.0;
        }
    }

    private static class VisitAgg {
        long completed;
        long total;
        VisitAgg(long completed, long total) {
            this.completed = completed;
            this.total = total;
        }
    }

    private VisitAgg getVisitStatusByQscThisMonth(List<Long> storeIds) {
        if (storeIds == null || storeIds.isEmpty()) return new VisitAgg(0, 0);

        // 이번 달 1일 00:00 ~ 다음달 1일 00:00
        LocalDate firstDay = LocalDate.now().withDayOfMonth(1);
        LocalDate nextMonthFirst = firstDay.plusMonths(1);

        OffsetDateTime from = firstDay.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = nextMonthFirst.atStartOfDay().atOffset(ZoneOffset.UTC);

        // qsc_master 기준: status='COMPLETED' & inspected_at in this month
        // store_id별로 1건이라도 있으면 방문 완료로 간주
        String sql = """
            SELECT COUNT(DISTINCT store_id)
            FROM qsc_master
            WHERE store_id IN (:storeIds)
              AND status = 'COMPLETED'
              AND inspected_at >= :from
              AND inspected_at < :to
        """;

        try {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("storeIds", storeIds)
                    .addValue("from", from)
                    .addValue("to", to);

            Long visitedStoreCnt = namedParameterJdbcTemplate.queryForObject(sql, params, Long.class);
            long visited = (visitedStoreCnt == null ? 0 : visitedStoreCnt);
            return new VisitAgg(visited, storeIds.size());
        } catch (DataAccessException e) {
            return new VisitAgg(0, storeIds.size());
        }
    }

    private List<SupervisorDashboardSummaryResponse.RecentVisitedStore> getRecentVisitedStoresByLatestQsc(
            List<Long> storeIds,
            List<Store> stores,
            int limit
    ) {
        if (storeIds == null || storeIds.isEmpty()) return List.of();

        // storeId -> storeName
        Map<Long, String> storeNameMap = stores.stream()
                .collect(Collectors.toMap(Store::getId, Store::getStoreName, (a, b) -> a));

        // 최신 COMPLETED QSC를 storeIds 전체에서 최신순으로 N개
        String sql = """
            SELECT store_id, MAX(inspected_at) AS last_inspected_at
            FROM qsc_master
            WHERE store_id IN (:storeIds)
              AND status = 'COMPLETED'
            GROUP BY store_id
            ORDER BY last_inspected_at DESC
            LIMIT :limit
        """;

        try {
            MapSqlParameterSource params = new MapSqlParameterSource()
                    .addValue("storeIds", storeIds)
                    .addValue("limit", Math.max(1, Math.min(limit, 20)));

            DateTimeFormatter fmt = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

            return namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
                long storeId = rs.getLong("store_id");
                OffsetDateTime visitedAt = rs.getObject("last_inspected_at", OffsetDateTime.class);

                String storeName = storeNameMap.getOrDefault(storeId, "알 수 없음");
                String visitedAtStr = (visitedAt == null) ? null : visitedAt.format(fmt);

                return new SupervisorDashboardSummaryResponse.RecentVisitedStore(
                        storeId,
                        storeName,
                        visitedAtStr
                );
            });

        } catch (DataAccessException e) {
            return List.of();
        }
    }

    // normalize utils
    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return keyword.trim();
    }

    private int normalizeLimit(Integer limit) {
        int v = (limit == null ? 50 : limit);
        return Math.max(1, Math.min(v, 200));
    }

    private StoreSort normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) return StoreSort.INSPECTED_AT_DESC;
        try {
            return StoreSort.valueOf(sort.trim().toUpperCase());
        } catch (Exception e) {
            return StoreSort.INSPECTED_AT_DESC;
        }
    }

    // Sort enum (서버에서 강제)
    private enum StoreSort {
        QSC_SCORE_DESC(Comparator
                .comparing(StoreListResponse::getQscScore, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed()
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        QSC_SCORE_ASC(Comparator
                .comparing(StoreListResponse::getQscScore, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        INSPECTED_AT_DESC(Comparator
                .comparing(StoreListResponse::getLastInspectionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed()
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        INSPECTED_AT_ASC(Comparator
                .comparing(StoreListResponse::getLastInspectionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder())));

        private final Comparator<StoreListResponse> comparator;

        StoreSort(Comparator<StoreListResponse> comparator) {
            this.comparator = comparator;
        }

        public Comparator<StoreListResponse> getComparator() {
            return comparator;
        }
    }
}
