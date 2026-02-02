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
import com.franchise.backend.user.security.UserPrincipal;
import com.franchise.backend.user.entity.Role;


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
    private final com.franchise.backend.user.repository.UserRepository userRepository;


    // 팀장 홈 대시보드 상단 카드
    // 팀장/관리자 홈 대시보드 상단 카드 (스코프 적용)
    public DashboardSummaryResponse getSummary(UserPrincipal principal) {

        if (principal == null) {
            // 로그인 안 된 상태면 401이 맞지만, 일단 0 반환
            return new DashboardSummaryResponse(0, 0, 0);
        }

        Role role = principal.getRole();
        String loginId = principal.getLoginId();

        // 1) 스코프 storeIds 계산
        // - ADMIN: null (전체)
        // - MANAGER: 본인 department 기반 점포들
        // - SUPERVISOR: 본인 담당 점포들
        List<Long> scopedStoreIds = resolveScopedStoreIds(role, loginId);

        // 2) 위험 점포 수
        long riskCount;
        if (scopedStoreIds == null) {
            // ADMIN 전체
            riskCount = storeRepository.countByCurrentState(StoreState.RISK);
        } else if (scopedStoreIds.isEmpty()) {
            riskCount = 0;
        } else {
            riskCount = storeRepository.countByCurrentStateAndIdIn(StoreState.RISK, scopedStoreIds);
        }

        // 3) 신규 이벤트 수(최근 48h)
        OffsetDateTime since48h = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);

        long newEventCount;
        if (scopedStoreIds == null) {
            // ADMIN 전체
            newEventCount = eventLogRepository.countNewEventsSince(since48h);
        } else if (scopedStoreIds.isEmpty()) {
            newEventCount = 0;
        } else {
            newEventCount = eventLogRepository.countNewEventsSinceForStores(scopedStoreIds, since48h);
        }

        // 4) 관리 공백 점포 수 (최근 QSC 점검이 30일 초과이거나, 점검 기록이 없는 점포)
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.ofHours(9));
        OffsetDateTime gapThreshold = now.minusDays(30);

        long managementGapCount;
        if (scopedStoreIds == null) {
            // ADMIN 전체 기준
            // (전체 storeIds를 구해서 처리)
            List<Long> allStoreIds = storeRepository.findAll().stream()
                    .map(Store::getId)
                    .toList();

            if (allStoreIds.isEmpty()) {
                managementGapCount = 0;
            } else {
                Map<Long, OffsetDateTime> lastInspectedAtMap = qscMasterRepository
                        .findLatestCompletedByStoreIds(allStoreIds)
                        .stream()
                        .collect(Collectors.toMap(
                                QscMaster::getStoreId,
                                QscMaster::getInspectedAt,
                                (a, b) -> a
                        ));

                managementGapCount = allStoreIds.stream()
                        .filter(storeId -> {
                            OffsetDateTime last = lastInspectedAtMap.get(storeId);
                            return (last == null) || last.isBefore(gapThreshold);
                        })
                        .count();
            }

        } else if (scopedStoreIds.isEmpty()) {
            managementGapCount = 0;

        } else {
            // MANAGER / SUPERVISOR 스코프 기준
            Map<Long, OffsetDateTime> lastInspectedAtMap = qscMasterRepository
                    .findLatestCompletedByStoreIds(scopedStoreIds)
                    .stream()
                    .collect(Collectors.toMap(
                            QscMaster::getStoreId,
                            QscMaster::getInspectedAt,
                            (a, b) -> a
                    ));

            managementGapCount = scopedStoreIds.stream()
                    .filter(storeId -> {
                        OffsetDateTime last = lastInspectedAtMap.get(storeId);
                        return (last == null) || last.isBefore(gapThreshold);
                    })
                    .count();
        }


        return new DashboardSummaryResponse(riskCount, newEventCount, managementGapCount);
    }

    private List<Long> resolveScopedStoreIds(Role role, String loginId) {
        if (role == null || loginId == null || loginId.isBlank()) {
            return List.of();
        }

        if (role == Role.ADMIN) {
            return null; // 전체
        }

        if (role == Role.SUPERVISOR) {
            return storeRepository.findStoreIdsBySupervisorLoginId(loginId.trim());
        }

        if (role == Role.MANAGER) {
            String dept = userRepository.findByLoginId(loginId.trim())
                    .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                    .orElse(null);

            if (dept == null || dept.isBlank()) return List.of();

            return storeRepository.findStoreIdsBySupervisorDepartment(dept);
        }

        return List.of();
    }


    // 팀장 홈 점포 검색 / 필터 / 정렬 (팀장 부서 기준)
    public List<StoreListResponse> getStoresForManager(String managerLoginId, StoreSearchRequest condition) {

        // 안전한 limit
        int safeLimit = normalizeLimit(condition.getLimit());

        // 팀장 조회 → department 확보
        String loginId = (managerLoginId == null ? null : managerLoginId.trim());
        if (loginId == null || loginId.isBlank()) {
            return List.of();
        }

        String department = userRepository.findByLoginId(loginId)
                .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                .orElse(null);

        // DB에서 "상태/키워드 + (SV.department=팀장.department)" 로 후보 조회
        List<Store> stores = storeRepository.searchStoresForManager(
                condition.getState(),
                normalizeKeyword(condition.getKeyword()),
                department
        );

        // storeIds
        List<Long> storeIds = stores.stream()
                .map(Store::getId)
                .toList();

        List<QscMaster> qscList = qscMasterRepository.findLatestCompletedByStoreIds(storeIds);

        //System.out.println("QSC FOUND COUNT = " + qscList.size());
        //qscList.forEach(q ->
        //        System.out.println(
        //                "QSC storeId=" + q.getStoreId()
        //                        + ", score=" + q.getTotalScore()
        //                        + ", inspectedAt=" + q.getInspectedAt()
        //        )
        //);

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


                    // 점포 리스트에 sv 이름
                    String supervisorDisplay = "-";

                    // 점포 리스트의 권역 이름
                    String regionDisplay = (s.getRegionCode() == null || s.getRegionCode().isBlank())
                            ? "-"
                            : s.getRegionCode();

                    if (s.getSupervisor() != null) {
                        // supervisor 표시
                        String userName = s.getSupervisor().getUserName();
                        if (userName != null && !userName.isBlank()) {
                            supervisorDisplay = userName.trim();
                        } else {
                            String supervisorLoginId = s.getSupervisor().getLoginId();
                            supervisorDisplay = (supervisorLoginId == null || supervisorLoginId.isBlank())
                                    ? "-"
                                    : supervisorLoginId;
                        }

                        // region 표시 (users.region)
                        String userRegion = s.getSupervisor().getRegion();
                        if (userRegion != null && !userRegion.isBlank()) {
                            regionDisplay = userRegion.trim();
                        }
                    }


                    return new StoreListResponse(
                            s.getId(),
                            s.getStoreName(),
                            s.getCurrentState().name(),
                            regionDisplay,
                            supervisorDisplay,
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


    // ADMIN 점포 목록
    public List<StoreListResponse> getStoresForAdmin(StoreSearchRequest condition) {

        int safeLimit = normalizeLimit(condition.getLimit());

        List<Store> stores = storeRepository.searchStoresForAdmin(
                condition.getState(),
                normalizeKeyword(condition.getKeyword())
        );

        List<Long> storeIds = stores.stream().map(Store::getId).toList();

        Map<Long, QscMaster> latestQscMap = storeIds.isEmpty()
                ? Map.of()
                : qscMasterRepository.findLatestCompletedByStoreIds(storeIds)
                .stream()
                .collect(Collectors.toMap(
                        QscMaster::getStoreId,
                        q -> q,
                        (a, b) -> a.getInspectedAt().isAfter(b.getInspectedAt()) ? a : b
                ));

        List<StoreListResponse> rows = stores.stream()
                .map(s -> {
                    QscMaster q = latestQscMap.get(s.getId());

                    Integer qscScore = (q != null ? q.getTotalScore() : 0);
                    LocalDate lastInspectionDate =
                            (q != null && q.getInspectedAt() != null)
                                    ? q.getInspectedAt().toLocalDate()
                                    : null;

                    String supervisorDisplay = "-";
                    String regionDisplay = "-";

                    if (s.getSupervisor() != null) {
                        supervisorDisplay = Optional.ofNullable(s.getSupervisor().getUserName())
                                .filter(v -> !v.isBlank())
                                .orElse(s.getSupervisor().getLoginId());

                        regionDisplay = Optional.ofNullable(s.getSupervisor().getRegion())
                                .orElse(s.getRegionCode());
                    }

                    return new StoreListResponse(
                            s.getId(),
                            s.getStoreName(),
                            s.getCurrentState().name(),
                            regionDisplay,
                            supervisorDisplay,
                            qscScore,
                            lastInspectionDate
                    );
                })
                .toList();

        StoreSort sort = normalizeSort(condition.getSort());
        rows = rows.stream().sorted(sort.getComparator()).toList();

        return rows.size() > safeLimit ? rows.subList(0, safeLimit) : rows;
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

        // 6) 평균 매출 변화율 추이(프로젝트 기준 월 고정: 2025-05 ~ 2025-08)
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
                // 프로젝트 기준 월(더미데이터 존재 구간)으로 고정
                List.of(
                        new SupervisorDashboardSummaryResponse.TrendPoint("5월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("6월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("7월", 0.0),
                        new SupervisorDashboardSummaryResponse.TrendPoint("8월", 0.0)
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
            return 0;
        }
    }

    private long countPendingActions(List<Long> storeIds) {
        if (storeIds == null || storeIds.isEmpty()) return 0;

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

    /**
     * 프로젝트 기준 월 고정:
     * - 더미데이터 범위가 2025-03-01 ~ 2025-08-31 이므로
     * - "최근 4개월"을 시스템 현재월(2026-01) 기준으로 잡으면 전부 0이 나옴
     * - 그래서 SV 홈 매출 추이는 2025-05, 06, 07, 08 로 고정한다.
     */
    private List<SupervisorDashboardSummaryResponse.TrendPoint> getMonthlyAvgSalesChangeRateTrend(List<Long> storeIds) {

        if (storeIds == null || storeIds.isEmpty()) {
            return List.of(
                    new SupervisorDashboardSummaryResponse.TrendPoint("5월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("6월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("7월", 0.0),
                    new SupervisorDashboardSummaryResponse.TrendPoint("8월", 0.0)
            );
        }

        // 고정 월: 2025-05 ~ 2025-08
        List<YearMonth> yms = List.of(
                YearMonth.of(2025, 5),
                YearMonth.of(2025, 6),
                YearMonth.of(2025, 7),
                YearMonth.of(2025, 8)
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

        String sql = """
            SELECT COALESCE(SUM(sales_amount), 0)
            FROM pos_daily
            WHERE store_id IN (:storeIds)
              AND business_date >= :startDate
              AND business_date < :endDate
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

        // (현재 로직 유지) 이번 달 1일 00:00 ~ 다음달 1일 00:00
        LocalDate firstDay = LocalDate.now().withDayOfMonth(1);
        LocalDate nextMonthFirst = firstDay.plusMonths(1);

        OffsetDateTime from = firstDay.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime to = nextMonthFirst.atStartOfDay().atOffset(ZoneOffset.UTC);

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

        Map<Long, String> storeNameMap = stores.stream()
                .collect(Collectors.toMap(Store::getId, Store::getStoreName, (a, b) -> a));

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
