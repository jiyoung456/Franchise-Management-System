package com.franchise.backend.event.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class StoreEventResponse {

    private Long eventId;
    private Long ruleId;
    private Long storeId;

    private String eventType;
    private String severity;
    private String status;

    private String summary;
    private OffsetDateTime occurredAt;

    private String relatedEntityType;  // nullable
    private Long relatedEntityId;      // nullable

    private Integer occurrenceCount;
    private OffsetDateTime lastNotifiedAt; // nullable

    private Long assignedToUserId; // nullable
}
