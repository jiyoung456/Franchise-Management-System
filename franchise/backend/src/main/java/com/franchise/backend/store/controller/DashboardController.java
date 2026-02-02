package com.franchise.backend.store.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.store.dto.AdminDashboardSummaryResponse;
import com.franchise.backend.store.dto.DashboardSummaryResponse;
import com.franchise.backend.store.dto.SupervisorDashboardSummaryResponse;
import com.franchise.backend.store.service.AdminDashboardService;
import com.franchise.backend.store.service.DashboardService;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final AdminDashboardService adminDashboardService;

    // 팀장 홈 대시보드 카드 조회
    @GetMapping("/summary")
    public ApiResponse<DashboardSummaryResponse> summary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ApiResponse.ok(dashboardService.getSummary(principal));
    }

    // SV 홈 대시보드
    @GetMapping("/supervisor/summary")
    public ApiResponse<SupervisorDashboardSummaryResponse> supervisorSummary(
            @RequestParam(name = "loginId") String loginId
    ) {
        return ApiResponse.ok(dashboardService.getSupervisorSummary(loginId));
    }

    // ADMIN 홈 대시보드 (카드 4개 + 위험점포 TOP5)
    @GetMapping("/admin/summary")
    public ApiResponse<AdminDashboardSummaryResponse> adminSummary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: login required");
        }
        if (principal.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: ADMIN only");
        }

        return ApiResponse.ok(adminDashboardService.getAdminSummary());
    }
}
