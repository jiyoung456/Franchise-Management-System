package com.franchise.backend.briefing.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class FocusPointDto {

    private Integer storeId;
    private String storeName;
    private String severity;
    private String reason;
}
