package com.franchise.backend.pos.controller;

import com.franchise.backend.pos.dto.dashboard.PosDashboardResponse;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import com.franchise.backend.pos.service.PosDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pos/admin")
public class PosAdminDashboardController {

    private final PosDashboardService posDashboardService;

    /**
     * ADMIN POS 대시보드
     * GET /api/pos/admin/dashboard?periodType=WEEK&periodStart=2024-01-22
     */
    @GetMapping("/dashboard")
    public PosDashboardResponse getDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam PosPeriodType periodType,
            @RequestParam(required = false) LocalDate periodStart

    ) {
        String loginId = userDetails.getUsername();
        System.out.println("[ADMIN_DASH] loginId=" + loginId + ", authorities=" + userDetails.getAuthorities());

        LocalDate asOf = LocalDate.of(2025, 8, 25);
        LocalDate start = (periodStart != null) ? periodStart : asOf;

        return posDashboardService.getDashboard(
                loginId,
                periodType,
                start
        );
    }
}
