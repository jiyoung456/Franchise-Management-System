package com.franchise.backend.qsc.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QscDashboardRankingResponse {

    // "2026-01"
    private String month;

    // "top" | "bottom"
    private String type;

    private Integer limit;

    private List<QscDashboardRankingItem> items;
}
