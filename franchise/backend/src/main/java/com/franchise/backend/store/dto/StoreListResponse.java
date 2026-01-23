package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StoreListResponse {
    private Long storeId;
    private String storeName;
    private String state;
    private String region;
    private String supervisor;
    private Integer qscScore;
    private LocalDate lastInspectionDate;
}
