package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class FocusPointCheckedDto {

    @JsonProperty("check_id")
    private Long checkId;

    private Boolean check;

    @JsonProperty("to_do")
    private String toDo;

    private String priority;
}

