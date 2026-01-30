package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.dashboard.*;
import com.franchise.backend.qsc.service.QscDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sv/qsc/dashboard")
public class QscDashboardController {

    private final QscDashboardService qscDashboardService;

    /**
     * 요약 카드
     * GET /api/sv/qsc/dashboard/summary?month=2026-01
     */
    @GetMapping("/summary")
    public QscDashboardSummaryResponse getSummary(
            @RequestParam String month
    ) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getMonthlySummary(svId, month);
    }

    /**
     * 최근 N개월 추이
     * GET /api/sv/qsc/dashboard/trend?endMonth=2026-01&months=6
     */
    @GetMapping("/trend")
    public QscDashboardTrendResponse getTrend(
            @RequestParam String endMonth,
            @RequestParam(defaultValue = "6") int months
    ) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getTrend(svId, endMonth, months);
    }

    /**
     * 랭킹
     * GET /api/sv/qsc/dashboard/ranking?month=2026-01&type=top&limit=3
     */
    @GetMapping("/ranking")
    public QscDashboardRankingResponse getRanking(
            @RequestParam String month,
            @RequestParam(defaultValue = "top") String type,
            @RequestParam(defaultValue = "3") int limit
    ) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getRanking(svId, month, type, limit);
    }

    /**
     * 🔐 인증 컨텍스트에서 SV(userId) 추출
     * - 실제 구현에서는 SecurityContext / Jwt / CustomPrincipal 등 사용
     */
    private Long getCurrentSupervisorId() {
        // TODO 실제 인증 로직으로 교체
        // 예:
        // return ((CustomUserDetails) SecurityContextHolder.getContext()
        //        .getAuthentication().getPrincipal()).getUserId();

        throw new IllegalStateException("SupervisorId resolver not implemented");
    }
}
