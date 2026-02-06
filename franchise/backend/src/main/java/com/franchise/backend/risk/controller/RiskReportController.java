package com.franchise.backend.risk.controller;

import com.franchise.backend.risk.dto.RiskDetailResponse;
import com.franchise.backend.risk.dto.RiskHistoryItemResponse;
import com.franchise.backend.risk.dto.RiskReportResponse;
import com.franchise.backend.risk.service.RiskReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/risk/report")
public class RiskReportController {

    private final RiskReportService riskReportService;

    // 상세 (최신 Top3)
    @GetMapping("/{storeId}/latest")
    public RiskDetailResponse latest(@PathVariable Integer storeId) {
        return riskReportService.getLatestDetail(storeId);
    }

    // 리포트 (최신 정량/정성) : snapshotDate 파라미터가 없을 때만
    @GetMapping(value = "/{storeId}", params = "!snapshotDate")
    public RiskReportResponse report(@PathVariable Integer storeId) {
        return riskReportService.getLatestReport(storeId);
    }

    // 리포트 (날짜별) : snapshotDate 파라미터가 있을 때만
    @GetMapping(value = "/{storeId}", params = "snapshotDate")
    public RiskReportResponse reportSnapshot(
            @PathVariable Integer storeId,
            @RequestParam LocalDate snapshotDate
    ) {
        return riskReportService.getReport(storeId, snapshotDate);
    }

    // 히스토리 리스트: snapshot_date 기준 목록
    @GetMapping("/{storeId}/history")
    public List<RiskHistoryItemResponse> history(@PathVariable Integer storeId) {
        return riskReportService.getHistory(storeId);
    }

    // 날짜 클릭 → 해당 날짜 상세 1건
    // 예: /api/risk/report/120/detail?snapshotDate=2025-08-31
    @GetMapping("/{storeId}/detail")
    public RiskDetailResponse detail(
            @PathVariable Integer storeId,
            @RequestParam LocalDate snapshotDate
    ) {
        return riskReportService.getDetailByDate(storeId, snapshotDate);
    }
}
