package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.event.repository.EventManagementRepository;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventManagementService {

    private final EventLogRepository eventLogRepository;
    private final EventManagementRepository eventManagementRepository;
    private final EventScopeService eventScopeService;

    // 이벤트 관리 - 상단 카드 (Role 스코프 적용)
    @Transactional(readOnly = true)
    public EventDashboardSummaryResponse getSummary(UserPrincipal principal) {

        List<Long> storeIds = eventScopeService.resolveAccessibleStoreIds(principal);

        // ADMIN이면 storeIds == null (전체)
        long openCount;
        long criticalCount;

        // SV/팀장인데 접근 가능한 점포가 0개면 바로 0 리턴
        if (storeIds != null && storeIds.isEmpty()) {
            return new EventDashboardSummaryResponse(0, 0, 0);
        }

        if (storeIds == null) {
            openCount = eventLogRepository.countOpenEvents();
            criticalCount = eventLogRepository.countCriticalOpenEvents();
        } else {
            openCount = eventLogRepository.countOpenEventsForStores(storeIds);
            criticalCount = eventLogRepository.countCriticalOpenEventsForStores(storeIds);
        }

        long actionInProgressCount = 0;

        return new EventDashboardSummaryResponse(openCount, criticalCount, actionInProgressCount);
    }

    // 이벤트 관리 - 리스트 조회 (Role 스코프 적용)
    @Transactional(readOnly = true)
    public List<EventListItemResponse> getEvents(UserPrincipal principal, String keyword, String status, int limit) {

        List<Long> storeIds = eventScopeService.resolveAccessibleStoreIds(principal);

        // SV/팀장인데 점포 0개면 빈 리스트
        if (storeIds != null && storeIds.isEmpty()) {
            return List.of();
        }

        String normalizedKeyword = normalizeKeyword(keyword);
        String normalizedStatus = normalizeStatus(status);

        int safeLimit = Math.max(1, Math.min(limit, 200));

        return eventManagementRepository.searchEvents(
                normalizedStatus,
                normalizedKeyword,
                storeIds, // ADMIN이면 null(전체), 그 외는 IN 필터
                PageRequest.of(0, safeLimit)
        );
    }

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return keyword.trim();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return null;
        String s = status.trim().toUpperCase();
        if (s.equals("OPEN") || s.equals("ACK") || s.equals("CLOSED")) return s;
        return null;
    }
}
