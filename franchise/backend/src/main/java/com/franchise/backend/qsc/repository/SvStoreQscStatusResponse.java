package com.franchise.backend.qsc.dto.storestatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SvStoreQscStatusResponse {

    private String month; // yyyy-MM
    private Long totalStoreCount;
    private Long underInspectedCount; // 이번달 2건 미달(0~1건)

    private List<Item> items;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Item {
        private Long storeId;
        private String storeName;
        private String regionCode;

        private String latestGrade;              // 전체 기간 최신 CONFIRMED 1건
        private OffsetDateTime latestConfirmedAt;

        private Long thisMonthInspectionCount;   // 이번달 CONFIRMED 건수
        private Boolean underInspected;          // thisMonthInspectionCount < 2
    }
}
