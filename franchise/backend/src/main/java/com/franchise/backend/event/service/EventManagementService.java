package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.event.repository.EventManagementRepository;
import com.franchise.backend.user.repository.UserRepository;
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
    private final UserRepository userRepository;

    // 이벤트 관리 - 상단 카드 (팀장 부서 기준)
    @Transactional(readOnly = true)
    public EventDashboardSummaryResponse getSummary(String managerLoginId) {

        String dept = resolveManagerDepartment(managerLoginId);

        long openCount = eventLogRepository.countOpenEventsByDepartment(dept);
        long criticalCount = eventLogRepository.countCriticalOpenEventsByDepartment(dept);

        // 조치(Action) 도메인 아직 “완전 구현 전”이면 0
        long actionInProgressCount = 0;

        return new EventDashboardSummaryResponse(openCount, criticalCount, actionInProgressCount);
    }

    // 이벤트 관리 - 리스트 조회 (팀장 부서 기준)
    @Transactional(readOnly = true)
    public List<EventListItemResponse> getEvents(String managerLoginId, String keyword, String status, int limit) {

        String dept = resolveManagerDepartment(managerLoginId);

        String normalizedKeyword = normalizeKeyword(keyword);
        String normalizedStatus = normalizeStatus(status);

        int safeLimit = Math.max(1, Math.min(limit, 200));

        return eventManagementRepository.searchEventsForManagerDepartment(
                dept,
                normalizedStatus,
                normalizedKeyword,
                PageRequest.of(0, safeLimit)
        );
    }

    private String resolveManagerDepartment(String managerLoginId) {
        String loginId = (managerLoginId == null ? null : managerLoginId.trim());
        if (loginId == null || loginId.isBlank()) {
            throw new IllegalArgumentException("로그인 정보가 없습니다.");
        }

        return userRepository.findByLoginId(loginId)
                .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                .filter(d -> d != null && !d.isBlank())
                .orElseThrow(() -> new IllegalArgumentException("팀장 department 정보를 찾을 수 없습니다. loginId=" + loginId));
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
