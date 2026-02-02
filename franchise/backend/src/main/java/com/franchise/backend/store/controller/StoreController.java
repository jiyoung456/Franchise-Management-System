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
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stores")
public class StoreController {

    private final DashboardService dashboardService;
    private final StoreService storeService;
    private final EventQueryService eventQueryService;

    // 점포 목록 조회 (팀장 홈)
    // - state: NORMAL/WATCHLIST/RISK (없으면 전체)
    // - keyword: 점포명 / 담당 SV(login_id)
    // - sort:
    //   - QSC_SCORE_DESC (높은순)
    //   - QSC_SCORE_ASC (낮은순)
    //   - INSPECTED_AT_DESC (최근 점검 최신순)
    //   - INSPECTED_AT_ASC (최근 점검 오래된순)
    // - limit: 기본 50, 최대 200
    @GetMapping
    public ApiResponse<List<StoreListResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) StoreState state,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "50") int limit
    ) {
        StoreSearchRequest condition = new StoreSearchRequest();
        condition.setState(state);
        condition.setKeyword(keyword);
        condition.setSort(sort);
        condition.setLimit(limit);

        // 팀장 loginId는 토큰에서 가져옴
        String managerLoginId = principal.getLoginId();

        return ApiResponse.ok(dashboardService.getStoresForManager(managerLoginId, condition));
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

    // 수정
    // SV 담당 점포 목록 조회 ( + 상태 / 정렬 / 검색 / limit)
    @GetMapping("/supervisor")
    public ApiResponse<List<StoreListResponse>> listForSupervisor(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) StoreState state,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "50") int limit
    ) {
        if (principal == null) {
            // 401로 보내는 게 정석
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Unauthorized: login required"
            );
        }

        String supervisorLoginId = principal.getLoginId();

        StoreSearchRequest condition = new StoreSearchRequest();
        condition.setState(state);
        condition.setKeyword(keyword);
        condition.setSort(sort);
        condition.setLimit(limit);

        return ApiResponse.ok(storeService.getStoresForSupervisor(supervisorLoginId, condition));
    }

}
