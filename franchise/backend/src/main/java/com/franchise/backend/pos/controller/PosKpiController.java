package com.franchise.backend.pos.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.pos.dto.PosKpiDashboardResponse;
import com.franchise.backend.pos.service.PosKpiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stores")
public class PosKpiController {

    private final PosKpiService posKpiService;

    // KPI 상세 분석 대시보드 (주간/월간)
    @GetMapping("/{storeId}/pos/kpi")
    public ApiResponse<PosKpiDashboardResponse> kpi(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "WEEK") String periodType,
            @RequestParam(defaultValue = "12") int limit
    ) {
        return ApiResponse.ok(posKpiService.getDashboard(storeId, periodType, limit));
    }
}
