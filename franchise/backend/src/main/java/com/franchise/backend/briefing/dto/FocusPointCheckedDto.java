package com.franchise.backend.briefing.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class FocusPointCheckedDto {

    private Integer checkId;
    private Boolean check;
    private String toDo;
    private String priority;
}

