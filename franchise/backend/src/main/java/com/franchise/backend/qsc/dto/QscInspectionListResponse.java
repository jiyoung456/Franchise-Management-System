package com.franchise.backend.qsc.dto;

import java.time.OffsetDateTime;

public record QscInspectionListResponse(
        Long inspectionId,
        Long storeId,
        String storeName,
        String regionCode,
        String status,
        String inspectorName,
        OffsetDateTime inspectedAt,
        Integer totalScore,
        String grade,
        Boolean isPassed
) {}
