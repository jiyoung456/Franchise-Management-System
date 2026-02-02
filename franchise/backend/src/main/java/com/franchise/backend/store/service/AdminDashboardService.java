package com.franchise.backend.store.service;

import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.store.dto.AdminDashboardSummaryResponse;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final StoreRepository storeRepository;
    private final EventLogRepository eventLogRepository;
    private final ActionRepository actionRepository;

    public AdminDashboardSummaryResponse getAdminSummary() {

        // 전체 점포 수
        long totalStoreCount = storeRepository.count();

        // 위험 점포 수 (RISK)
        long riskStoreCount = storeRepository.countByCurrentState(StoreState.RISK);

        // 신규 이벤트 수 (최근 48시간)
        OffsetDateTime since = OffsetDateTime.now(ZoneOffset.UTC).minusHours(48);
        long newEventCount = eventLogRepository.countNewEventsSince(since);

        // 조치 미이행 / 지연 수
        long pendingActionCount =
                actionRepository.countAllInProgressEventLinkedActions(
                        List.of("OPEN", "IN_PROGRESS")
                );

        // 위험 점포 TOP 5 (RISK + 위험점수 desc)
        List<Store> topStores =
                storeRepository.findTopRiskStores(PageRequest.of(0, 5));

        List<AdminDashboardSummaryResponse.RiskStoreTopResponse> riskTop5 =
                topStores.stream()
                        .map(s -> new AdminDashboardSummaryResponse.RiskStoreTopResponse(
                                s.getId(),
                                s.getStoreName(),
                                s.getCurrentStateScore() == null ? 0 : s.getCurrentStateScore()
                        ))
                        .toList();

        return new AdminDashboardSummaryResponse(
                totalStoreCount,
                riskStoreCount,
                newEventCount,
                pendingActionCount,
                riskTop5
        );
    }
}
