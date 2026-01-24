package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class EventListItemResponse {

    private Long eventId;
    private Long storeId;
    private String storeName;   // 이벤트 관리 화면에 필요

    private String eventType;   // POS_SALES_DROP ...
    private String issueType;   // POS / QSC / RISK / OPS / SM (UI 라벨용)
    private String severity;    // INFO/WARNING/CRITICAL
    private String status;      // OPEN/ACK/CLOSED

    private String summary;
    private OffsetDateTime occurredAt;

    // 화면에서 Risk Score 같은 걸 보여주고 싶으면 stores.current_state_score를 내려줄 수 있음
    // (없으면 null/0 처리 가능)
    private Integer storeRiskScore; // nullable
}
