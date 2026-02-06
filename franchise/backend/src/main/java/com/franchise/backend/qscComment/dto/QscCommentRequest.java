package com.franchise.backend.qscComment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class QscCommentRequest {

    @JsonProperty("inspection_id")
    private Long inspectionId;

    @JsonProperty("summary_comment")
    private String summaryComment;

}

