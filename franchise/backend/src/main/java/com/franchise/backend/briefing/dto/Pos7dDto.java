package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class Pos7dDto {

    @JsonProperty("pos_period_agg_id")
    private Long posPeriodAggId;

    @JsonProperty("store_id")
    private Long storeId;

    private Long aov;

    @JsonProperty("sale_amount")
    private Long saleAmount;

    @JsonProperty("order_count")
    private Long orderCount;

    @JsonProperty("cogs_amount")
    private Long cogsAmount;

    @JsonProperty("margin_amount")
    private Long marginAmount;

    @JsonProperty("margin_rate")
    private Double marginRate;

    @JsonProperty("sale_change_rate")
    private Double saleChangeRate;

    @JsonProperty("order_change_rate")
    private Double orderChangeRate;

    @JsonProperty("aov_change_rate")
    private Double aovChangeRate;

    // getters / setters
}
