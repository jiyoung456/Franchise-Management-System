package com.franchise.backend.qsc.dto;

import java.time.LocalDate;
import java.util.List;

public record QscTemplateUpsertRequest(
        String templateName,
        String inspectionType,     // REGULAR, SPECIAL, REINSPECTION
        String version,            // 예: Regular_260204 (프론트/백에서 결정)
        LocalDate effectiveFrom,
        LocalDate effectiveTo,     // nullable
        Integer passScoreMin,      // 1~100
        String status,             // ACTIVE/INACTIVE (optional)
        Scope scope,               // 단일 적용범위로 가정 (필요하면 List로 바꾸면 됨)
        List<Category> categories
) {
    public record Scope(
            String scopeType, // GLOBAL, REGION, STORE, DIRECT
            Long scopeRefId   // GLOBAL이면 null
    ) {}

    public record Category(
            String categoryCode,   // QUALITY, SERVICE, CLEANLINESS, SAFETY
            String categoryName,
            Integer categoryWeight, // UI에서 30/30/30/10 넣는다고 가정 (원하면 null 허용)
            List<Item> items
    ) {}

    public record Item(
            String itemName,
            Boolean isRequired,
            Integer sortOrder
    ) {}
}
