package com.franchise.backend.action.controller;

import com.franchise.backend.action.dto.*;
import com.franchise.backend.action.service.LeaderActionService;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/actions")
public class ActionController {

    private final LeaderActionService leaderActionService;
//feature/2-be-sv-pos

    // 조치관리 목록 (SV/MANAGER/ADMIN 모두 여기로 들어오게 하고 Role별 분기)
    @GetMapping
    public List<ActionListResponse> getActions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "50") int limit
    ) {
        if (principal == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Unauthorized: login required"
            );
        }

        return leaderActionService.getActionList(
                principal.getLoginId(),
                principal.getRole(),
                status,
                limit
        );
    }


    // 진행중 조치 수 요약 (SV/MANAGER/ADMIN Role별 스코프 분기)
    @GetMapping("/summary")
    public ActionCountSummaryResponse getSummary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Unauthorized: login required"
            );
        }

        return leaderActionService.getSummary(
                principal.getLoginId(),
                principal.getRole()
        );
    }


    @GetMapping("/{actionId}")
    public ActionDetailResponse getActionDetail(@PathVariable Long actionId) {
        return leaderActionService.getActionDetail(actionId);
    }

    @PostMapping
    public ResponseEntity<Long> createAction(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ActionCreateRequest request
    ) {
        if (principal == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Unauthorized: login required"
            );
        }

        // 로그인 유저 기준 createdByUserId
        Long createdByUserId = principal.getUserId();

        Long actionId = leaderActionService.createAction(request, createdByUserId);
        return ResponseEntity.ok(actionId);
    }

    @PutMapping("/{actionId}")
    public ResponseEntity<Void> updateAction(
            @PathVariable Long actionId,
            @RequestBody ActionUpdateRequest request
    ) {
        leaderActionService.updateAction(actionId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{actionId}/effect")
    public ActionEffectResponse getEffect(@PathVariable Long actionId) {
        return leaderActionService.getActionEffect(actionId);
    }
}
