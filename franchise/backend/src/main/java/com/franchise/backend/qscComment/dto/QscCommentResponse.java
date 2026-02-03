package com.franchise.backend.qscComment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class QscCommentResponse {

    @JsonProperty("topic_json")
    private List<String> topicJson;

    @JsonProperty("keyword_json")
    private List<String> keywordJson;

    private String summary;

    @JsonProperty("analyzed_at")
    private LocalDateTime analyzedAt;

    @JsonProperty("model_name")
    private String modelName;

    @JsonProperty("prompt_version")
    private String promptVersion;

}
