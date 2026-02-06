package com.franchise.backend.pos.controller;

import com.franchise.backend.pos.dto.dashboard.PosDashboardResponse;
import com.franchise.backend.pos.dto.dashboard.detail.PosStoreDashboardResponse;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import com.franchise.backend.pos.service.PosDashboardService;
import com.franchise.backend.pos.service.PosStoreDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pos/supervisor")
public class PosDashboardController {

    private final PosDashboardService posDashboardService;

    @GetMapping("/dashboard")
    public PosDashboardResponse getDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam PosPeriodType periodType,
            @RequestParam(required = false) LocalDate periodStart
    ) {
        String loginId = userDetails.getUsername();

        LocalDate asOf = LocalDate.of(2025, 8, 25);
        LocalDate start = (periodStart != null) ? periodStart : asOf;

        return posDashboardService.getDashboard(loginId, periodType, start);
    }
}

