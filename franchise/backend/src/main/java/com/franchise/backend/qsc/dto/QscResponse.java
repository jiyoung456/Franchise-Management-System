package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class QscResponse {

    private Long inspectionId;
    private Long storeId;
    private Long templateId;
    private Long inspectorId;

    private OffsetDateTime inspectedAt;
    private String status;

    private Integer totalScore;
    private String grade; // S/A/B/C/D

    private Boolean isPassed;
    private Boolean needsReinspection;

    private String summaryComment;
    private OffsetDateTime confirmedAt;
}
