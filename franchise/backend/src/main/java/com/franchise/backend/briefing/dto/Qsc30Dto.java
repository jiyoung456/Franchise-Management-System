package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class Qsc30Dto {

    @JsonProperty("inspection_id")
    private Integer inspectionId;

    @JsonProperty("store_id")
    private Integer storeId;

    @JsonProperty("store_name")
    private String storeName;

    private String confirmed;

    @JsonProperty("total_score")
    private Integer totalScore;

    private String comment;

    // getters / setters
}
