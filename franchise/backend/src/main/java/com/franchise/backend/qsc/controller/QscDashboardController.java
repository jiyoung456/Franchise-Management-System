package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.dashboard.*;
import com.franchise.backend.qsc.service.QscDashboardService;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sv/qsc/dashboard")
public class QscDashboardController {

    private final QscDashboardService qscDashboardService;

    @GetMapping("/summary")
    public QscDashboardSummaryResponse getSummary(@RequestParam String month) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getMonthlySummary(svId, month);
    }

    @GetMapping("/trend")
    public QscDashboardTrendResponse getTrend(
            @RequestParam String endMonth,
            @RequestParam(defaultValue = "6") int months
    ) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getTrend(svId, endMonth, months);
    }

    @GetMapping("/ranking")
    public QscDashboardRankingResponse getRanking(
            @RequestParam String month,
            @RequestParam(defaultValue = "top") String type,
            @RequestParam(defaultValue = "3") int limit
    ) {
        Long svId = getCurrentSupervisorId();
        return qscDashboardService.getRanking(svId, month, type, limit);
    }

    private Long getCurrentSupervisorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null || "anonymousUser".equals(auth.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Object p = auth.getPrincipal();
        if (!(p instanceof UserPrincipal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        UserPrincipal principal = (UserPrincipal) p;

        // ✅ users.user_id 를 supervisor id 로 사용
        return principal.getUserId();
    }
}
