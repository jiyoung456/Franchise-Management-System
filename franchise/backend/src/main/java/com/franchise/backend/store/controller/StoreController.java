package com.franchise.backend.store.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.event.dto.StoreEventResponse;
import com.franchise.backend.event.service.EventQueryService;
import com.franchise.backend.store.dto.StoreDetailResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
import com.franchise.backend.store.dto.StoreUpdateRequest;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.service.DashboardService;
import com.franchise.backend.store.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stores")
public class StoreController {

    private final DashboardService dashboardService;
    private final StoreService storeService;
    private final EventQueryService eventQueryService;

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

    // 점포 상세(가게 정보)
    @GetMapping("/{storeId}")
    public ApiResponse<StoreDetailResponse> detail(@PathVariable Long storeId) {
        return ApiResponse.ok(storeService.getStoreDetail(storeId));
    }

    // 점포 상세 - 이벤트 목록(최신순)
    @GetMapping("/{storeId}/events")
    public ApiResponse<List<StoreEventResponse>> events(
            @PathVariable Long storeId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ApiResponse.ok(eventQueryService.getStoreEvents(storeId, limit));
    }

    // 점포 정보 수정(모달 저장하기)
    @PatchMapping("/{storeId}")
    public ApiResponse<StoreDetailResponse> update(
            @PathVariable Long storeId,
            @RequestBody(required = false) StoreUpdateRequest request
    ) {
        return ApiResponse.ok(storeService.updateStore(storeId, request));
    }
}
