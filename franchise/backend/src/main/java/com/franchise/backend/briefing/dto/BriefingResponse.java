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

    @JsonProperty("target_date")
    private LocalDate targetDate;

    @JsonProperty("focus_point_json")
    private List<FocusPointDto> focusPointJson;

    @JsonProperty("focus_point_json_checked")
    private List<FocusPointCheckedDto> focusPointJsonChecked;

    @JsonProperty("top_stroe_json")
    private TopStoreJsonDto topStroeJson;

    @JsonProperty("summary_text")
    private String summaryText;

    @JsonProperty("generate_at")
    private LocalDateTime generateAt;
}

