package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class BriefingRequest {

    @JsonProperty("user_id")
    private Integer userId;

    private String role;

    private String department;

    @JsonProperty("store_list")
    private List<StoreDto> storeList;

    @JsonProperty("qsc_30_list")
    private List<Qsc30dDto> qsc30List;

    @JsonProperty("no_action")
    private List<NoActionDto> noActionList;

    @JsonProperty("event_48_list")
    private List<Event48hDto> event48List;

    @JsonProperty("pos_7_list")
    private List<Pos7dDto> pos7List;

    @JsonProperty("contract_end_imminent")
    private List<ContractEndImminentDto> contractEndImminent;

    // getters / setters
}
