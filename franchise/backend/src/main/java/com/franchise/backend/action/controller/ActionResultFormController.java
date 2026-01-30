package com.franchise.backend.action.controller;

import com.franchise.backend.action.dto.ActionResultFormResponse;
import com.franchise.backend.action.service.ActionResultFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import com.franchise.backend.action.dto.ActionExecutionSaveRequest;
import com.franchise.backend.action.dto.ActionResultFormResponse;
import com.franchise.backend.action.service.ActionExecutionCommandService;
import com.franchise.backend.action.service.ActionResultFormService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/actions")
public class ActionResultFormController {

    private final ActionResultFormService actionResultFormService;
    private final ActionExecutionCommandService actionExecutionCommandService;

    @GetMapping("/{actionId}/execution")
    public ActionResultFormResponse getResultForm(@PathVariable Long actionId) {
        return actionResultFormService.getForm(actionId);
    }

    @PostMapping("/{actionId}/execution")
    public ResponseEntity<Void> saveExecution(@PathVariable Long actionId,
            @RequestBody ActionExecutionSaveRequest request) {
        actionExecutionCommandService.saveExecutionAndClose(actionId, request);
        return ResponseEntity.ok().build();
    }
}
