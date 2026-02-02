package com.franchise.backend.qsc.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record QscInspectionDetailResponse(
        Long inspectionId,
        Long templateId,
        Long storeId,
        OffsetDateTime inspectedAt,
        String status,
        Integer totalScore,
        String grade,
        Boolean isPassed,
        Boolean needsReinspection,
        String summaryComment,
        List<ItemScore> itemScores,

        // ✅ 이미 추가했던 것들
        List<Photo> photos,
        AiAnalysis aiAnalysis,

        // ✅ 이번에 추가 (화면 왼쪽용)
        List<CategoryScore> categoryScores,
        List<Section> sections
) {
    public record ItemScore(Long templateItemId, Integer score) {}

    public record Photo(Long photoId, String photoUrl, String photoName, OffsetDateTime createdAt) {}

    public record AiAnalysis(Integer riskScore, List<String> riskTags, String evidenceText, String status) {}

    // ✅ 카테고리(영역) 점수 카드
    public record CategoryScore(
            Long categoryId,
            String categoryCode,   // CLEANLINESS / SERVICE / QUALITY / SAFETY
            String categoryName,   // "청결" 등
            Integer score,         // 계산된 점수
            Integer maxScore       // categoryWeight(예: 30/30/30/10)
    ) {}

    // ✅ 카테고리별 항목 리스트
    public record Section(
            Long categoryId,
            String categoryCode,
            String categoryName,
            List<ItemDetail> items
    ) {}

    public record ItemDetail(
            Long templateItemId,
            String itemName,
            Integer score,        // 1~5
            Integer maxScore,     // 일단 5 고정
            Integer sortOrder
    ) {}
}
