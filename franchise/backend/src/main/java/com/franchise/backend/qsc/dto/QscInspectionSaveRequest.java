package com.franchise.backend.qsc.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record QscInspectionSaveRequest(
        Long templateId,
        Long storeId,
        OffsetDateTime inspectedAt,
        String status,                  // "DRAFT" or "COMPLETED"
        String summaryComment,           // 종합 의견

        List<ItemScore> itemScores,      // 문항별 점수(1~5)
        List<Photo> photos               // 사진 URL/이름 (일단 업로드는 나중에)
) {

    public record ItemScore(
            Long templateItemId,
            Integer score               // 1~5
    ) {}

    public record Photo(
            String photoUrl,
            String photoName
    ) {}
}
