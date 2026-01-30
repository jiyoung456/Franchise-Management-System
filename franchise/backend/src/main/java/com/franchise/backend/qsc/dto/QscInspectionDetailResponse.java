package com.franchise.backend.qsc.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record QscInspectionDetailResponse(
        Long inspectionId,
        Long templateId,
        Long storeId,
        OffsetDateTime inspectedAt,
        String status,            // DRAFT / COMPLETED
        Integer totalScore,       // COMPLETED면 값 있음
        String grade,             // COMPLETED면 값 있음 (S/A/B/C/D)
        Boolean isPassed,
        Boolean needsReinspection,
        String summaryComment,
        List<ItemScore> itemScores
) {
    public record ItemScore(
            Long templateItemId,
            Integer score
    ) {}
}
