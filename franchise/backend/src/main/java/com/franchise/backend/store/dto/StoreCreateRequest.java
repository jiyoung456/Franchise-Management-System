package com.franchise.backend.store.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class StoreCreateRequest {

    private String storeName;          // 필수
    private String regionCode;         // 필수
    private String address;            // 필수

    private String tradeAreaType;      // 필수: OFFICE/RESIDENTIAL/STATION/UNIVERSITY/TOURISM/MIXED
    private LocalDateTime openPlannedAt; // 필수

    private String ownerName;
    private String ownerPhone;

    private String supervisorLoginId; // 필수 (담당 SV loginId)

    private String contractType;      // 필수: FRANCHISE/DIRECT
    private LocalDate contractEndDate; // 선택
}
