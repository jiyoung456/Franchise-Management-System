package com.franchise.backend.store.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stores")
public class StoreController {

    private final DashboardService dashboardService;

    // 점포 목록 조회
    // 팀장 홈 : 키워드 검색 (점포명 / 담당 SV)
    // 팀장 홈 : qsc 점수 및 최근 점검일은 qsc 테이블 연동 후 수정 예정
    @GetMapping
    public ApiResponse<List<StoreListResponse>> list(
            @RequestParam(required = false) StoreState state,
            @RequestParam(required = false) String keyword
    ) {
        StoreSearchRequest condition = new StoreSearchRequest();
        condition.setState(state);
        condition.setKeyword(keyword);

        return ApiResponse.ok(dashboardService.getStores(condition));
    }
}
