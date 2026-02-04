package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;


@Getter
@Setter
@NoArgsConstructor
@ToString
public class Event48hDto {

    @JsonProperty("event_id")
    private Long eventId;

    @JsonProperty("store_id")
    private Long storeId;

    @JsonProperty("store_name")
    private String storeName;

    @JsonProperty("event_type")
    private String eventType;

    private String severity;

    private String summary;

    // getters / setters
}
