package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class BriefingResponse {

    @JsonProperty("focus_point_json")
    private List<FocusPointJsonDto> focusPointJson;

    @JsonProperty("focus_point_json_checked")
    private List<FocusPointJsonCheckedDto> focusPointJsonChecked;

    @JsonProperty("top_store_json")
    private TopStoreJsonDto topStoreJson;

    @JsonProperty("summary_text")
    private String summaryText;

    @JsonProperty("generate_at")
    private LocalDateTime generateAt;
}

