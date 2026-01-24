package com.franchise.backend.event.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.event.dto.EventDashboardSummaryResponse;
import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.service.EventManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventManagementController {

    private final EventManagementService eventManagementService;

    // 이벤트 관리 - 상단 카드 요약
    @GetMapping("/summary")
    public ApiResponse<EventDashboardSummaryResponse> summary() {
        return ApiResponse.ok(eventManagementService.getSummary());
    }

    // 이벤트 관리 - 리스트 조회
    // - keyword: 점포명 검색
    // - status: OPEN / ACK / CLOSED (없으면 전체)
    // - limit: 기본 50
    @GetMapping
    public ApiResponse<List<EventListItemResponse>> list(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "50") int limit
    ) {
        return ApiResponse.ok(eventManagementService.getEvents(keyword, status, limit));
    }
}
