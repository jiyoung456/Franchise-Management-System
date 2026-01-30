package com.franchise.backend.qsc.template.dto;

import java.util.List;

public record QscTemplateDetailResponse(
        Long templateId,
        String templateName,
        String inspectionType,
        String version,
        List<Category> categories
) {
    public record Category(
            Long templateCategoryId,
            String categoryCode,
            String categoryName,
            Integer categoryWeight,
            List<Item> items
    ) {}

    public record Item(
            Long templateItemId,
            String itemName,
            Boolean isRequired,
            Integer sortOrder
    ) {}
}
