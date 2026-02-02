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
    private List<StoreDto> storeDtoList;

    @JsonProperty("qsc_30_list")
    private List<Qsc30Dto> qsc30Dto30List;

    @JsonProperty("no_action")
    private List<NoActionDto> noActionDto;

    @JsonProperty("event_48_list")
    private List<EventDto> event48List;

    @JsonProperty("pos_7_list")
    private List<Pos7Dto> pos7Dto7List;

    @JsonProperty("contract_end_imminent")
    private List<ContractEndImminentDto> contractEndImminent;

    // getters / setters
}
