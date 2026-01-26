package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class EventDetailResponse {

    private Long eventId;
    private Long storeId;

    private String storeName;

    private String eventType;   // POS_SALES_DROP, QSC_FAIL, RISK_AI_DETECT ...
    private String issueType;   // POS / QSC / RISK / OPS / SM (UI 라벨용)
    private String severity;    // INFO/WARNING/CRITICAL
    private String status;      // OPEN/ACK/CLOSED

    private String summary;
    private OffsetDateTime occurredAt;

    private Integer storeRiskScore; // stores.current_state_score (nullable)

    private AnalysisResponse analysis; // QSC/POS/AI 등 상세 분석(없으면 null)


    // 상세 분석 영역 (필요한 것만 채우고 나머지는 null)
    @Getter
    @AllArgsConstructor
    public static class AnalysisResponse {

        // [QSC] 최근 점검 점수/등급
        private Integer qscTotalScore;     // ex) 70
        private String qscGrade;          // ex) "C"

        // [QSC] 직전 대비 변화 (latest - prev)
        private Integer qscDiffFromPrev;  // ex) -12

        // [QSC] 취약 카테고리 (없으면 null)
        private String weakCategory;      // ex) "위생 (Cleanliness)"

        // [QSC] 연관 점검일
        private OffsetDateTime inspectedAt;
    }
}
