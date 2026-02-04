package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

public record AdminQscTemplateListResponse(
        List<AdminQscTemplateListItemResponse> items
) {}
