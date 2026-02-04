package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.AdminQscTemplateListItemResponse;
import com.franchise.backend.qsc.dto.AdminQscTemplateListResponse;
import com.franchise.backend.qsc.repository.QscTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminQscTemplateService {

    private final QscTemplateRepository repository;

    public AdminQscTemplateListResponse getList(
            String type,     // REGULAR / SPECIAL / REINSPECTION
            String status,   // ACTIVE / INACTIVE
            String keyword
    ) {
        String typeParam = normalizeEnumParam(type);     // "REGULAR" or null
        String statusParam = normalizeEnumParam(status); // "ACTIVE" or null
        String keywordParam = (keyword == null) ? "" : keyword.trim();

        var templates = repository.searchAdminTemplates(typeParam, statusParam, keywordParam);

        List<AdminQscTemplateListItemResponse> items = templates.stream()
                .map(t -> new AdminQscTemplateListItemResponse(
                        t.getId(),
                        t.getTemplateName(),
                        t.getInspectionType() == null ? null : t.getInspectionType().name(),
                        t.getVersion(),
                        t.getStatus() == null ? null : t.getStatus().name(),
                        t.getEffectiveFrom()
                ))
                .toList();

        return new AdminQscTemplateListResponse(items);
    }

    private String normalizeEnumParam(String v) {
        if (v == null) return null;
        String s = v.trim();
        if (s.isEmpty()) return null;
        return s.toUpperCase(Locale.ROOT);
    }
}
