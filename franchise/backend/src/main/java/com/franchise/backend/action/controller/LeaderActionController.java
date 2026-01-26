package com.franchise.backend.action.controller;

import com.franchise.backend.action.dto.ActionListResponse;
import com.franchise.backend.action.service.LeaderActionService;
import org.springframework.web.bind.annotation.*;

import com.franchise.backend.action.dto.ActionDetailResponse;
import org.springframework.web.bind.annotation.PathVariable;

import com.franchise.backend.action.dto.ActionCreateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;


import java.util.List;

@RestController
@RequestMapping("/api/leader/actions")
public class LeaderActionController {

    private final LeaderActionService leaderActionService;

    public LeaderActionController(LeaderActionService leaderActionService) {
        this.leaderActionService = leaderActionService;
    }

    @GetMapping
    public List<ActionListResponse> getActions() {
        return leaderActionService.getActionList();
    }

    @GetMapping("/{actionId}")
    public ActionDetailResponse getActionDetail(@PathVariable Long actionId) {
        return leaderActionService.getActionDetail(actionId);
    }

    @PostMapping
    public ResponseEntity<Long> createAction(@RequestBody ActionCreateRequest request) {

        // 임시로 1L
        Long createdByUserId = 1L;

        Long actionId = leaderActionService.createAction(request, createdByUserId);
        return ResponseEntity.ok(actionId);
    }

}
