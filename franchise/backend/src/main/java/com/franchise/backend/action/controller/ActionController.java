package com.franchise.backend.action.controller;

import com.franchise.backend.action.dto.*;
import com.franchise.backend.action.service.LeaderActionService;
import com.franchise.backend.user.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actions")
public class ActionController {

    private final LeaderActionService leaderActionService;

    public ActionController(LeaderActionService leaderActionService) {
        this.leaderActionService = leaderActionService;
    }

    @GetMapping("/{actionId}")
    public ActionDetailResponse getActionDetail(@PathVariable Long actionId) {
        return leaderActionService.getActionDetail(actionId);
    }

    @PostMapping
    public ResponseEntity<Long> createAction(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody ActionCreateRequest request) {
        if (principal == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED,
                    "Unauthorized: login required");
        }

        // 로그인 유저 기준 createdByUserId
        Long createdByUserId = principal.getUserId(); // UserPrincipal에 getUserId()가 있어야 함

        Long actionId = leaderActionService.createAction(request, createdByUserId);
        return ResponseEntity.ok(actionId);
    }

    @PutMapping("/{actionId}")
    public ResponseEntity<Void> updateAction(
            @PathVariable Long actionId,
            @RequestBody ActionUpdateRequest request) {
        leaderActionService.updateAction(actionId, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{actionId}/effect")
    public ActionEffectResponse getEffect(@PathVariable Long actionId) {
        return leaderActionService.getActionEffect(actionId);
    }
}
