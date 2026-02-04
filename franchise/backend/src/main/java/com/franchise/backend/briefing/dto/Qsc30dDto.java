package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class Qsc30dDto {

    @JsonProperty("inspection_id")
    private Long inspectionId;

    @JsonProperty("store_id")
    private Long storeId;

    @JsonProperty("store_name")
    private String storeName;

    private LocalDate confirmed;

    @JsonProperty("total_score")
    private Integer totalScore;

    private String comment;

    // getters / setters
}
