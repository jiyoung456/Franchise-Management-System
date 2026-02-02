package com.franchise.backend.briefing.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class TargetDateDto {

    private Integer userId;
    private String role;
    private String department;

    private List<StoreDto> storeDtoList;
    private List<Qsc30Dto> qsc30Dto30List;
    private List<NoActionDto> noActionDto;
    private List<EventDto> event48List;
    private List<Pos7Dto> pos7Dto7List;
    private List<ContractEndImminentDto> contractEndImminent;
}

