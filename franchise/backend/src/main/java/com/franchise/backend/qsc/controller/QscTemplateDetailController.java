package com.franchise.backend.qsc.template.controller;

import com.franchise.backend.qsc.service.QscTemplateDetailService;
import com.franchise.backend.qsc.template.dto.QscTemplateDetailResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qsc/templates")
public class QscTemplateDetailController {

    private final QscTemplateDetailService qscTemplateDetailService;

    @GetMapping("/{templateId}")
    public QscTemplateDetailResponse getTemplateDetail(@PathVariable Long templateId) {
        return qscTemplateDetailService.getDetail(templateId);
    }
}
