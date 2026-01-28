package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.QscTemplateSummaryResponse;
import com.franchise.backend.qsc.service.QscTemplateQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qsc/inspection/new")
public class QscTemplateController {

    private final QscTemplateQueryService qscTemplateQueryService;

    @GetMapping
    public List<QscTemplateSummaryResponse> getTemplates() {
        return qscTemplateQueryService.getActiveTemplates();
    }
}
