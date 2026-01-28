package com.franchise.backend.qsc.service;

import com.franchise.backend.qsc.dto.QscTemplateSummaryResponse;
import com.franchise.backend.qsc.entity.QscTemplateStatus;
import com.franchise.backend.qsc.repository.QscTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QscTemplateQueryService {

    private final QscTemplateRepository qscTemplateRepository;

    public List<QscTemplateSummaryResponse> getActiveTemplates() {
        return qscTemplateRepository.findAllByOrderByEffectiveFromDesc()
                .stream()
                .filter(t -> t.getStatus() == QscTemplateStatus.ACTIVE)
                .map(t -> new QscTemplateSummaryResponse(
                        t.getId(),
                        t.getTemplateName(),
                        t.getInspectionType(),
                        t.getVersion()
                ))
                .toList();
    }
}
