package com.franchise.backend.pos.dto.dashboard.detail;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PosStoreDashboardResponse {
    private StoreInfoDto store;
    private StoreKpiDto kpi;
    private List<StoreTrendPointDto> trend;
}
