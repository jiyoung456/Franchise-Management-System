package com.franchise.backend.store.dto;

import com.franchise.backend.store.entity.Store;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import lombok.Builder;


@Getter
@Builder
@AllArgsConstructor
public class StoreListResponse {
    private Long storeId;
    private String storeName;
    private String state;
    private String region;
    private String supervisor;
    private Integer qscScore;
    private LocalDate lastInspectionDate;
    private Integer currentStateScore;

    public static StoreListResponse from(Store s) {
        return StoreListResponse.builder()
                .storeId(s.getId())
                .storeName(s.getStoreName())
                .currentStateScore(s.getCurrentStateScore())
                .build();
    }
}
