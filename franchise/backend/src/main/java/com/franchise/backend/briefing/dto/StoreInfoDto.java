package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import com.franchise.backend.store.entity.StoreState;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class StoreInfoDto {

    @JsonProperty("store_id")
    private Long storeId;

    @JsonProperty("store_name")
    private String storeName;

    @Enumerated(EnumType.STRING)
    @JsonProperty("current_state")
    private StoreState currentState;

    // getters / setters
    public StoreInfoDto(Long storeId, String storeName, StoreState currentState) {
        this.storeId = storeId;
        this.storeName = storeName;
        this.currentState = currentState;
    }
}


