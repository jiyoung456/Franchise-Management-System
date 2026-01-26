package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class EventDetailRow {

    private Long eventId;
    private Long storeId;
    private String storeName;

    private String eventType;
    private String severity;
    private String status;

    private String summary;
    private OffsetDateTime occurredAt;

    private Integer storeRiskScore; // stores.current_state_score
}
