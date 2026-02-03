package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class NoActionDto {

    @JsonProperty("action_id")
    private Integer actionId;

    @JsonProperty("store_id")
    private Integer storeId;

    @JsonProperty("store_name")
    private String storeName;

    private String title;

    private String description;

    // getters / setters
}
