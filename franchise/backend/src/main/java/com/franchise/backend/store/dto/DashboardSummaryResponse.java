package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long riskStoreCount;      // 위험 점포 수
    private long newEventCount;       // 신규 이벤트 수 (현재는 0)
    private long managementGapCount;  // 관리 공백 점포 수 (현재는 0)
}
