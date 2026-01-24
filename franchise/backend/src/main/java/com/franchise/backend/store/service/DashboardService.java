package com.franchise.backend.store.service;

import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StoreRepository storeRepository;
    private final EventLogRepository eventLogRepository;

    // 팀장 홈 대시보드 상단 카드
    public DashboardSummaryResponse getSummary() {

        // 위험 점포 수
        long riskCount = storeRepository.countByCurrentState(StoreState.RISK);

        // 신규 이벤트 수 (최근 48시간)
        OffsetDateTime since48h = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);
        long newEventCount = eventLogRepository.countNewEventsSince(since48h);

        // 관리 공백 점포 수
        // 아직 visit / 관리 공백 로직 미구현 → 요구사항대로 0 처리
        long managementGapCount = 0;

        return new DashboardSummaryResponse(
                riskCount,
                newEventCount,
                managementGapCount
        );
    }

    // 팀장 홈 점포 검색 / 필터
    public List<StoreListResponse> getStores(StoreSearchRequest condition) {

        List<Store> stores = storeRepository.searchStores(
                condition.getState(),
                normalizeKeyword(condition.getKeyword())
        );

        return stores.stream()
                .map(s -> new StoreListResponse(
                        s.getId(),
                        s.getStoreName(),
                        s.getCurrentState().name(),
                        s.getRegionCode(),
                        (s.getSupervisor() != null ? s.getSupervisor().getLoginId() : "-"),
                        0, // QSC 점수는 아직 0
                        null
                ))
                .toList();
    }

    // 내부 유틸 메서드
    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        return keyword.trim();
    }
}
