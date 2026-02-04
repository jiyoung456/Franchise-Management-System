package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.QscInspectionDetailResponse;
import com.franchise.backend.qsc.dto.QscInspectionListResponse;
import com.franchise.backend.qsc.dto.QscInspectionSaveRequest;
import com.franchise.backend.qsc.service.QscInspectionCommandService;
import com.franchise.backend.qsc.service.QscInspectionQueryService;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qsc/inspections")
public class QscInspectionController {

    private final QscInspectionCommandService commandService;
    private final QscInspectionQueryService queryService; // ✅ 추가

    @PostMapping
    public Map<String, Long> save(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody QscInspectionSaveRequest req
    ) {
        Long inspectionId = commandService.save(principal.getUserId(), req);
        return Map.of("inspectionId", inspectionId);
    }

    @PostMapping("/test")
    public Map<String, Long> saveTest(@RequestBody QscInspectionSaveRequest req) {
        Long inspectionId = commandService.save(1L, req);
        return Map.of("inspectionId", inspectionId);
    }

    @GetMapping("/{inspectionId}")
    public QscInspectionDetailResponse getDetail(@PathVariable Long inspectionId) {
        return queryService.getDetail(inspectionId); // ✅ 수정
    }

    @GetMapping
    public List<QscInspectionListResponse> getList(
            @RequestParam(required = false) String region, // Store.regionCode
            @RequestParam(required = false) String status  // QscMaster.status (COMPLETED/CONFIRMED)
    ) {
        return queryService.getList(region, status);
    }

}
