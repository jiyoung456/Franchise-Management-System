package com.franchise.backend.briefing.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class BriefingResponse {

    private TargetDateDto targetDateDto;

    private List<FocusPointDto> focusPointJson;

    private List<FocusPointCheckedDto> focusPointJsonChecked;

    private Map<String, Integer> topStroeJson;

    private String summaryText;

    private LocalDateTime generateAt;
}

