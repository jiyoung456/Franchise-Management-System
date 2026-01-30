package com.franchise.backend.qsc.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QscDashboardRankingItem {

    private Long storeId;
    private String storeName;

    private Integer score;
    private String grade;

    private String summaryComment;

    private OffsetDateTime confirmedAt;
}
