package com.franchise.backend.action.controller;

import com.franchise.backend.action.service.ActionSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/actions")
public class ActionSummaryController {

    private final ActionSummaryService actionSummaryService;

    @GetMapping("/summary")
    public ActionCountResponse getSummary() {
        long inProgressCount = actionSummaryService.countInProgressActions();
        return new ActionCountResponse(inProgressCount);
    }

    public record ActionCountResponse(long inProgressCount) {
    }
}
