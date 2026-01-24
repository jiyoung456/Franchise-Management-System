package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EventDashboardSummaryResponse {

    private long openEventCount;        // OPEN 이벤트 수
    private long criticalEventCount;    // CRITICAL(OPEN 기준) 이벤트 수
    private long actionInProgressCount; // 조치 진행중 수 (없으면 0)
}
