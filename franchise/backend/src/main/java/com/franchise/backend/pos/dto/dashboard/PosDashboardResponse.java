package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class PosDashboardResponse {
    private SummaryDto summary;
    private List<TrendPointDto> trend;
    private RankingDto ranking;
    private List<StorePerformanceRowDto> performanceList;
}
