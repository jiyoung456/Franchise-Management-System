package com.franchise.backend.risk.service;

import com.franchise.backend.risk.dto.RiskDetailResponse;
import com.franchise.backend.risk.dto.RiskHistoryItemResponse;
import com.franchise.backend.risk.dto.RiskReportResponse;
import com.franchise.backend.risk.entity.RiskReport;
import com.franchise.backend.risk.repository.RiskReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskReportService {

    // 변수명만 정리 (가독성/컨벤션)
    private final RiskReportRepository riskReportRepository;

    // 1) 최신 상세(Top3 + comment)
    public RiskDetailResponse getLatestDetail(Integer storeId) {
        RiskReport sr = riskReportRepository.findTopByStoreIdOrderBySnapshotDateDesc(storeId)
                .orElseThrow(() -> new IllegalArgumentException("No store_risk data for storeId=" + storeId));

        return toDetail(sr);
    }

    // 2) 최신 리포트(정량/정성)
    public RiskReportResponse getLatestReport(Integer storeId) {
        RiskReport sr = riskReportRepository.findTopByStoreIdOrderBySnapshotDateDesc(storeId)
                .orElseThrow(() -> new IllegalArgumentException("No store_risk data for storeId=" + storeId));

        return new RiskReportResponse(
                sr.getStoreId(),
                sr.getSnapshotDate(),
                sr.getRiskLabelFinal(),
                sr.getQscDomainPct(),
                sr.getPosDomainPct(),
                sr.getQscCleanPct(),
                sr.getQscServicePct(),
                sr.getQscProductPct(),
                sr.getPosSalesPct(),
                sr.getPosAovPct(),
                sr.getPosMarginPct(),
                sr.getCommentDomain(),
                sr.getCommentFocus(),
                sr.getDetailComment(),
                sr.getExternalFactorComment(),
                sr.getAnalysisType()
        );
    }

    // 3) 히스토리 리스트
    public List<RiskHistoryItemResponse> getHistory(Integer storeId) {
        return riskReportRepository.findByStoreIdOrderBySnapshotDateDesc(storeId)
                .stream()
                .map(sr -> new RiskHistoryItemResponse(
                        sr.getSnapshotDate(),
                        sr.getRiskLabelFinal(),
                        sr.getTopMetric1(),
                        sr.getTopMetric2(),
                        sr.getTopMetric3()
                ))
                .toList();
    }

    // 4) 날짜 클릭 → 해당 날짜 상세 1건
    public RiskDetailResponse getDetailByDate(Integer storeId, LocalDate snapshotDate) {
        RiskReport sr = riskReportRepository.findByStoreIdAndSnapshotDate(storeId, snapshotDate)
                .orElseThrow(() -> new IllegalArgumentException(
                        "No store_risk data for storeId=" + storeId + ", snapshotDate=" + snapshotDate));

        return toDetail(sr);
    }

    // 중복 제거
    private RiskDetailResponse toDetail(RiskReport sr) {
        return new RiskDetailResponse(
                sr.getStoreId(),
                sr.getSnapshotDate(),
                sr.getRiskLabelFinal(),
                sr.getTopMetric1(),
                sr.getTopMetric1Shap(),
                sr.getTopMetric2(),
                sr.getTopMetric2Shap(),
                sr.getTopMetric3(),
                sr.getTopMetric3Shap(),
                sr.getComment()
        );
    }
}
