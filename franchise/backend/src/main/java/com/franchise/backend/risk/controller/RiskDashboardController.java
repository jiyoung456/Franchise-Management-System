package com.franchise.backend.risk.controller;

import com.franchise.backend.risk.dto.RiskDashboardResponse;
import com.franchise.backend.risk.service.RiskDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/risk")
public class RiskDashboardController {

    private final RiskDashboardService riskDashboardService;

    @GetMapping
    public RiskDashboardResponse getRiskDashboard() {
        return riskDashboardService.getDashboard();
    }
}
