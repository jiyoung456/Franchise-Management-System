package com.franchise.backend.store.service;

import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.store.entity.StoreState;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StoreRepository storeRepository;

    // 팀장 홈 대시보드 상단 카드
    public DashboardSummaryResponse getSummary() {
        long riskCount = storeRepository.countByCurrentState(StoreState.RISK);

        return new DashboardSummaryResponse(riskCount, 0, 0);
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
