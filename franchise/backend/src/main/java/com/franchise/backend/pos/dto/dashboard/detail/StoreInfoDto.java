package com.franchise.backend.pos.dto.dashboard.detail;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StoreInfoDto {
    private Long storeId;
    private String storeName;
    private String regionCode;
    private String currentState; // NORMAL/WATCH_LIST/RISK
}
