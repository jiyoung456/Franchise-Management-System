package com.franchise.backend.action.controller;

import com.franchise.backend.action.service.MyActionSummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class MyActionSummaryController {

    private final MyActionSummaryService myActionSummaryService;

    @GetMapping("/{userId}/actions/summary")
    public MyActionSummaryResponse getMyActionSummary(@PathVariable Long userId) {
        long inProgressCount = myActionSummaryService.countMyInProgressActions(userId);
        return new MyActionSummaryResponse(inProgressCount);
    }

    public record MyActionSummaryResponse(long inProgressCount) {
    }
}
