package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;


public record AdminQscTemplateListItemResponse(
        Long templateId,
        String templateName,
        String inspectionType,
        String version,
        String status,
        LocalDate effectiveFrom
) {}
