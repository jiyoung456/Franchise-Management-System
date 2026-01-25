package com.franchise.backend.qsc.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.qsc.dto.QscResponse;
import com.franchise.backend.qsc.service.QscQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/qsc")
public class QscController {

    private final QscQueryService qscQueryService;

    // 점포별 QSC 목록(최신순)
    @GetMapping("/stores/{storeId}")
    public ApiResponse<List<QscResponse>> list(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ApiResponse.ok(qscQueryService.getStoreQscList(storeId, limit));
    }

    // 점포별 최신 QSC 1건
    @GetMapping("/stores/{storeId}/latest")
    public ApiResponse<QscResponse> latest(@PathVariable Long storeId) {
        return ApiResponse.ok(qscQueryService.getLatestStoreQsc(storeId));
    }
}
