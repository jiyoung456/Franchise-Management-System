package com.franchise.backend.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class StoreDetailResponse {

    // 상단 영역
    private Long storeId;
    private String storeName;
    private String regionCode;
    private String supervisorLoginId;

    private String storeOperationStatus; // OPEN/CLOSED
    private String currentState;         // NORMAL/WATCHLIST/RISK
    private Integer currentStateScore;   // 종합 위험 점수

    // 상태 카드 하단 정보
    private Integer qscScore;            // 최신 QSC 점수
    private Long weeklyAvgSalesAmount;   // 주간 평균 매출(최근 7일 평균, 원 단위)

    // 가게 정보 탭
    private LocalDate openedDate;           // opened_at -> 날짜만 (프론트에서 D+계산)
    private LocalDate lastStateChangedDate; // updated_at -> 날짜만 (UI: 마지막 상태 변경일)

    private String ownerName;
    private String ownerPhone;

    private String address;

    private String contractType;           // FRANCHISE/DIRECT
    private LocalDate contractEndDate;     // 만료일
}
