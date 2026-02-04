package com.franchise.backend.qsc.controller;// package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.AdminQscDashboardResponse;
import com.franchise.backend.qsc.service.AdminQscDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/qsc")
public class AdminQscDashboardController {

    private final AdminQscDashboardService adminQscDashboardService;

    // 예: /api/admin/qsc/dashboard?date=2026-01-10&regionCode=SEOUL&passFilter=FAIL&limit=20&offset=0
    @GetMapping("/dashboard")
    public AdminQscDashboardResponse dashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String regionCode,
            @RequestParam(required = false) String passFilter, // null / PASS / FAIL
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(defaultValue = "0") int offset
    )  {
        // ✅ 날짜 고정
        LocalDate fixedDate = LocalDate.of(2025, 8, 31);

        return adminQscDashboardService.getMonthlyDashboard(
                fixedDate,
                regionCode,
                passFilter,
                limit,
                offset
        );

}}