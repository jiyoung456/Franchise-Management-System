package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class AdminDashboardSummaryResponse {

    private long totalStoreCount;     // 전체 가맹점 수
    private long riskStoreCount;      // 위험(RISK) 점포 수
    private long newEventCount;       // 신규 이벤트 수 (48h)
    private long pendingActionCount;  // 조치 미이행/지연 수

    private List<RiskStoreTopResponse> riskTopStores; // 위험 점포 TOP5

    @Getter
    @AllArgsConstructor
    public static class RiskStoreTopResponse {
        private Long storeId;
        private String storeName;
        private Integer riskScore; // stores.current_state_score
    }
}
