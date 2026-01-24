package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.event.repository.EventManagementRepository;
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

    // 이벤트 관리 - 상단 카드
    @Transactional(readOnly = true)
    public EventDashboardSummaryResponse getSummary() {

        long openCount = eventLogRepository.countOpenEvents();
        long criticalCount = eventLogRepository.countCriticalOpenEvents();

        // 조치(Action) 도메인 아직 “완전 구현 전”이면 0으로 (요구사항: 임의값 금지)
        long actionInProgressCount = 0;

        return new EventDashboardSummaryResponse(openCount, criticalCount, actionInProgressCount);
    }

    // 이벤트 관리 - 리스트 조회 (최신순)
    @Transactional(readOnly = true)
    public List<EventListItemResponse> getEvents(String keyword, String status, int limit) {

        String normalizedKeyword = normalizeKeyword(keyword);
        String normalizedStatus = normalizeStatus(status);

        int safeLimit = Math.max(1, Math.min(limit, 200));

        return eventManagementRepository.searchEvents(
                normalizedStatus,
                normalizedKeyword,
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
        // 허용 상태만 받기 (그 외는 null 처리)
        if (s.equals("OPEN") || s.equals("ACK") || s.equals("CLOSED")) return s;
        return null;
    }
}
