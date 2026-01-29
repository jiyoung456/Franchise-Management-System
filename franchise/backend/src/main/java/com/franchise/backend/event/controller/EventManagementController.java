package com.franchise.backend.event.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventDetailResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.service.EventDetailService;
import com.franchise.backend.event.service.EventManagementService;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventManagementController {

    private final EventManagementService eventManagementService;
    private final EventDetailService eventDetailService;

    // 이벤트 관리 - 상단 카드 요약 (팀장 부서 범위)
    @GetMapping("/summary")
    public ApiResponse<EventDashboardSummaryResponse> summary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        String managerLoginId = principal.getLoginId();
        return ApiResponse.ok(eventManagementService.getSummary(managerLoginId));
    }

    // 이벤트 관리 - 리스트 조회 (팀장 부서 범위)
    // - keyword: 점포명 검색
    // - status: OPEN / ACK / CLOSED (없으면 전체)
    // - limit: 기본 50
    @GetMapping
    public ApiResponse<List<EventListItemResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "50") int limit
    ) {
        String managerLoginId = principal.getLoginId();
        return ApiResponse.ok(eventManagementService.getEvents(managerLoginId, keyword, status, limit));
    }

    // 이벤트 상세 조회 (상세는 eventId로 단건 조회이므로, 일단 기존 그대로 유지)
    @GetMapping("/{eventId}")
    public ApiResponse<EventDetailResponse> detail(@PathVariable Long eventId) {
        return ApiResponse.ok(eventDetailService.getEventDetail(eventId));
    }
}
