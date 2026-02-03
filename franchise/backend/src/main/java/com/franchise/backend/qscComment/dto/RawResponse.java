package com.franchise.backend.qscComment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class RawResponse {

    @JsonProperty("topic_json")
    private List<String> topicJson;

    @JsonProperty("keyword_json")
    private List<String> keywordJson;

    private String summary;

}
