package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class TopStoreJsonDto {

    @JsonProperty("store_cnt")
    private Integer storeCnt;

    @JsonProperty("issue_cnt")
    private Integer issueCnt;

    @JsonProperty("severity_cnt")
    private Integer severityCnt;

    @JsonProperty("no_action_cnt")
    private Integer noActionCnt;
}
