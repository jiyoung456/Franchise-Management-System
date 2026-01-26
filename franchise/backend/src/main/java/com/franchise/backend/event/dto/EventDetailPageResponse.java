package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class EventDetailPageResponse {

    // 1) 이벤트 핵심 요약(상단)
    private Long eventId;

    private Long storeId;
    private String storeName;

    private String eventType;   // POS_SALES_DROP ...
    private String issueType;   // POS / QSC / RISK / OPS / SM
    private String severity;    // INFO/WARNING/CRITICAL
    private String status;      // OPEN/ACK/CLOSED

    private String summary;
    private OffsetDateTime occurredAt;

    private Integer storeRiskScore; // nullable

    // 2) 발생 원인 지표 분석(하단) - 케이스별로 null 가능
    private AnalysisResponse analysis;

    @Getter
    @AllArgsConstructor
    public static class AnalysisResponse {

        // POS(매출)
        private Long recentWeekSales;       // nullable
        private Long salesChangeAmount;     // nullable
        private String rootCategoryLabel;   // nullable

        // QSC(점검)
        private Integer qscTotalScore;      // nullable
        private String qscGrade;            // nullable
        private Integer qscDiffFromPrev;    // nullable

        private String weakCategoryName;    // nullable
        private Integer weakCategoryScore;  // nullable
        private String weakCategoryLevel;   // nullable

        private OffsetDateTime inspectedAt; // nullable
        private String inspectionType;      // nullable

        private List<String> keyFindings;   // nullable
    }
}
