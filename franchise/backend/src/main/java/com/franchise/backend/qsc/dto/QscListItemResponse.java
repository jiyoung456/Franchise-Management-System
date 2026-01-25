package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class QscListItemResponse {

    private Long inspectionId;
    private OffsetDateTime inspectedAt;

    private String status;
    private Integer totalScore;
    private String grade;

    private Boolean isPassed;
    private Boolean needsReinspection;
    private String summaryComment;
}
