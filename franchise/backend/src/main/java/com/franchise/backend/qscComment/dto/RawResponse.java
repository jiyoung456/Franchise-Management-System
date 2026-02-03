package com.franchise.backend.qscComment.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RawResponse {

    private Map<String, Object> response;

}
