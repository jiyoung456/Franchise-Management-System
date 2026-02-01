package com.franchise.backend.pos.controller;

import com.franchise.backend.pos.dto.dashboard.detail.PosStoreDashboardResponse;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import com.franchise.backend.pos.service.PosStoreDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pos/supervisor")
public class PosStoreDashboardController {

    private final PosStoreDashboardService posStoreDashboardService;

    @GetMapping("/stores/{storeId}/dashboard")
    public PosStoreDashboardResponse getStoreDashboard(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long storeId,
            @RequestParam PosPeriodType periodType,
            @RequestParam LocalDate periodStart
    ) {
        String loginId = userDetails.getUsername();
        return posStoreDashboardService.getStoreDashboard(loginId, storeId, periodType, periodStart);
    }
}
