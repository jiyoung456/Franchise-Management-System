package com.franchise.backend.store.service;

import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StoreRepository storeRepository;
    private final EventLogRepository eventLogRepository;
    private final QscMasterRepository qscMasterRepository;

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
        // toMap 중복키 방지(혹시 동일 store_id가 중복으로 들어오는 상황 대비)
        Map<Long, QscMaster> latestQscMap = storeIds.isEmpty()
                ? Map.of()
                : qscMasterRepository.findLatestCompletedByStoreIds(storeIds)
                .stream()
                .collect(Collectors.toMap(
                        QscMaster::getStoreId,
                        q -> q,
                        (a, b) -> {
                            // inspectedAt이 더 최신인 걸 남김(동일하면 a 유지)
                            if (a.getInspectedAt() == null) return b;
                            if (b.getInspectedAt() == null) return a;
                            return a.getInspectedAt().isAfter(b.getInspectedAt()) ? a : b;
                        }
                ));

        // StoreListResponse로 변환(여기서 qscScore / lastInspectionDate 채움)
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
