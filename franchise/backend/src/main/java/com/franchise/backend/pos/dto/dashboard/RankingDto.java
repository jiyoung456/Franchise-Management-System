package com.franchise.backend.pos.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class RankingDto {
    private List<StorePerformanceRowDto> top5;
    private List<StorePerformanceRowDto> low5;
}
