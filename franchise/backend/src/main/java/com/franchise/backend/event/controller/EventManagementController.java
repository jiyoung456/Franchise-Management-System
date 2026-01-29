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

    // 이벤트 관리 - 상단 카드 요약 (Role 스코프 적용)
    @GetMapping("/summary")
    public ApiResponse<EventDashboardSummaryResponse> summary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(eventManagementService.getSummary(principal));
    }

    // 이벤트 관리 - 리스트 조회 (Role 스코프 적용)
    @GetMapping
    public ApiResponse<List<EventListItemResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ApiResponse.ok(eventManagementService.getEvents(principal, keyword, status, limit));
    }

    // 이벤트 상세 조회 (Role 스코프 적용 + 보안)
    @GetMapping("/{eventId}")
    public ApiResponse<EventDetailResponse> detail(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long eventId
    ) {
        return ApiResponse.ok(eventDetailService.getEventDetail(principal, eventId));
    }
}
