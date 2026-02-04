package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class StoreDto {

    @JsonProperty("store_id")
    private Long storeId;

    @JsonProperty("store_name")
    private String storeName;

    @JsonProperty("current_state")
    private String currentState;

    // getters / setters

}


