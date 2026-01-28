package com.franchise.backend.qsc.dto;

import com.franchise.backend.qsc.entity.QscInspectionType;

public record QscTemplateSummaryResponse(
        Long templateId,
        String templateName,
        QscInspectionType inspectionType,
        String version
) {}
