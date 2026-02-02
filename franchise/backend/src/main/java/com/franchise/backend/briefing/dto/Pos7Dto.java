package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class Pos7Dto {

    @JsonProperty("pos_period_agg")
    private Integer posPeriodAgg;

    @JsonProperty("store_id")
    private Integer storeId;

    @JsonProperty("store_name")
    private String storeName;

    private Integer aov;

    @JsonProperty("sale_amount")
    private Long saleAmount;

    @JsonProperty("order_count")
    private Integer orderCount;

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
