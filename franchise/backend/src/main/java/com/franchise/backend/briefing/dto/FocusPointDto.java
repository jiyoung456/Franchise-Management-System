package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class FocusPointDto {

    @JsonProperty("store_id")
    private Integer storeId;

    @JsonProperty("store_name")
    private String storeName;

    private String severity;
    private String reason;
}
