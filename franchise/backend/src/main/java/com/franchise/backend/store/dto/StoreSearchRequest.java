package com.franchise.backend.store.dto;

import com.franchise.backend.store.entity.StoreState;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoreSearchRequest {
    private StoreState state; // NORMAL / WATCHLIST / RISK
    private String keyword;   // 점포명 or SV
}
