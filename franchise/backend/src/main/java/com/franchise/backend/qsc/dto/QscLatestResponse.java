package com.franchise.backend.qsc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.OffsetDateTime;

@Getter
@AllArgsConstructor
public class QscLatestResponse {

    private Long inspectionId;
    private Long storeId;

    private Integer totalScore;
    private String grade;      // "S/A/B/C/D"
    private String status;     // "CONFIRMED"
    private OffsetDateTime inspectedAt;
}
