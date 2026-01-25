package com.franchise.backend.store.dto;

import com.franchise.backend.store.entity.StoreState;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreSearchRequest {
    private StoreState state; // NORMAL / WATCHLIST / RISK
    private String keyword;   // 점포명 or SV
    private String sort;      // QSC_SCORE_DESC / QSC_SCORE_ASC / INSPECTED_AT_DESC / INSPECTED_AT_ASC
    private Integer limit;    // 기본 50
}
