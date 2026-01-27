package com.franchise.backend.store.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.SupervisorDashboardSummaryResponse;
import com.franchise.backend.store.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    // 팀장 홈 대시보드 카드 조회
    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary() {
        return ApiResponse.ok(dashboardService.getSummary());
    }

    // SV 홈 대시보드
    @GetMapping("/supervisor/summary")
    public ApiResponse<SupervisorDashboardSummaryResponse> supervisorSummary(
            @RequestParam(name = "loginId") String loginId
    ) {
        return ApiResponse.ok(dashboardService.getSupervisorSummary(loginId));
    }
}
