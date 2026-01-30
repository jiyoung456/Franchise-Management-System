package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.event.repository.EventManagementRepository;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.Role;
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
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    // 이벤트 관리 - 상단 카드 (스코프 적용)
    @Transactional(readOnly = true)
    public EventDashboardSummaryResponse getSummary(Role role, String loginId) {

        List<Long> scopedStoreIds = resolveScopedStoreIds(role, loginId);

        long openCount;
        long criticalCount;

        // ADMIN: 전체
        if (scopedStoreIds == null) {
            openCount = eventLogRepository.countOpenEvents();
            criticalCount = eventLogRepository.countCriticalOpenEvents();
        } else {
            // 스코프인데 점포가 0개면 결과도 0
            if (scopedStoreIds.isEmpty()) {
                openCount = 0;
                criticalCount = 0;
            } else {
                openCount = eventLogRepository.countOpenEventsByStoreIds(scopedStoreIds);
                criticalCount = eventLogRepository.countCriticalOpenEventsByStoreIds(scopedStoreIds);
            }
        }

        long actionInProgressCount = 0; // 액션 도메인 아직 0

        return new EventDashboardSummaryResponse(openCount, criticalCount, actionInProgressCount);
    }

    // 이벤트 관리 - 리스트 조회 (스코프 적용)
    @Transactional(readOnly = true)
    public List<EventListItemResponse> getEvents(Role role, String loginId, String keyword, String status, int limit) {

        String normalizedKeyword = normalizeKeyword(keyword);
        String normalizedStatus = normalizeStatus(status);
        int safeLimit = Math.max(1, Math.min(limit, 200));

        List<Long> scopedStoreIds = resolveScopedStoreIds(role, loginId);

        // 스코프인데 점포가 0개면 빈 리스트
        if (scopedStoreIds != null && scopedStoreIds.isEmpty()) {
            return List.of();
        }

        return eventManagementRepository.searchEvents(
                scopedStoreIds, // ADMIN이면 null → 전체
                normalizedStatus,
                normalizedKeyword,
                PageRequest.of(0, safeLimit)
        );
    }

    // Role별 스코프 storeIds 계산
    private List<Long> resolveScopedStoreIds(Role role, String loginId) {
        if (role == null) return List.of();

        // ADMIN: 전체 범위 → null로 내려서 쿼리에서 조건 제외
        if (role == Role.ADMIN) {
            return null;
        }

        // loginId 필수
        if (loginId == null || loginId.isBlank()) {
            return List.of();
        }

        // SV: 내 점포만
        if (role == Role.SUPERVISOR) {
            return storeRepository.findStoreIdsBySupervisorLoginId(loginId.trim());
        }

        // MANAGER: 내 department 구해서, 그 부서 SV 점포들
        if (role == Role.MANAGER) {
            String dept = userRepository.findByLoginId(loginId.trim())
                    .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                    .orElse(null);

            if (dept == null || dept.isBlank()) {
                return List.of();
            }
            return storeRepository.findStoreIdsBySupervisorDepartment(dept);
        }

        return List.of();
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
