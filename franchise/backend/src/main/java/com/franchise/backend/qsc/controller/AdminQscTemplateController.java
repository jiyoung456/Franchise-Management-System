package com.franchise.backend.qsc.controller;

import com.franchise.backend.common.response.ApiResponse;

import com.franchise.backend.qsc.dto.AdminQscTemplateListResponse;
import com.franchise.backend.qsc.dto.QscTemplateDetailResponse;
import com.franchise.backend.qsc.dto.QscTemplateUpsertRequest;
import com.franchise.backend.qsc.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/qsc/templates")
public class AdminQscTemplateController {

    private final AdminQscTemplateService listService;
    private final QscTemplateCommandService commandService;
    private final QscTemplateDetailService detailService;

    /**
     * 목록 + 필터
     */
    @GetMapping
    public ApiResponse<AdminQscTemplateListResponse> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword
    ) {
        return ApiResponse.ok(listService.getList(type, status, keyword));
    }

    /**
     * 상세
     */
    @GetMapping("/{templateId}")
    public ApiResponse<QscTemplateDetailResponse> detail(
            @PathVariable Long templateId
    ) {
        return ApiResponse.ok(detailService.getDetail(templateId));
    }

    /**
     * 신규 등록
     */
    @PostMapping
    public ApiResponse<QscTemplateDetailResponse> create(
            @RequestBody QscTemplateUpsertRequest req
    ) {
        return ApiResponse.ok(
                commandService.createTemplate(1L, req) // 관리자 ID
        );
    }

    /**
     * 수정
     */
    @PutMapping("/{templateId}")
    public ApiResponse<QscTemplateDetailResponse> update(
            @PathVariable Long templateId,
            @RequestBody QscTemplateUpsertRequest req
    ) {
        return ApiResponse.ok(
                commandService.updateTemplate(templateId, req)
        );
    }
}
