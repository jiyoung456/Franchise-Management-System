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

    // 팀장 홈 점포 검색 / 필터 (리스트)
    public List<StoreListResponse> getStores(StoreSearchRequest condition) {

        List<Store> stores = storeRepository.searchStores(
                condition.getState(),
                normalizeKeyword(condition.getKeyword())
        );

        List<Long> storeIds = stores.stream()
                .map(Store::getId)
                .toList();

        // storeIds가 비면 그냥 QSC 조회 안 함
        Map<Long, QscMaster> latestQscMap = storeIds.isEmpty()
                ? Map.of()
                : qscMasterRepository.findLatestCompletedByStoreIds(storeIds)
                .stream()
                .collect(Collectors.toMap(QscMaster::getStoreId, q -> q));

        return stores.stream()
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
                .toList();
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return keyword.trim();
    }
}
