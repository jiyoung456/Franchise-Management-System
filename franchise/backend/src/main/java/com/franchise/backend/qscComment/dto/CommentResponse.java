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
public class CommentResponse {

    @JsonProperty("source_text")
    private String sourceText;

    @JsonProperty("topic_json")
    private List<String> topicJson;

    @JsonProperty("keyword_json")
    private List<String> keywordJson;

    private String summary;

    @JsonProperty("raw_response_json")
    private CommentResponse rawResponseJson;

    @JsonProperty("analyzed_at")
    private LocalDateTime analyzedAt;

    @JsonProperty("model_name")
    private String modelName;

    @JsonProperty("prompt_version")
    private String promptVersion;

    public String getSourceText() {
        return sourceText;
    }

    public void setSourceText(String sourceText) {
        this.sourceText = sourceText;
    }

    public List<String> getTopicJson() {
        return topicJson;
    }

    public void setTopicJson(List<String> topicJson) {
        this.topicJson = topicJson;
    }

    public List<String> getKeywordJson() {
        return keywordJson;
    }

    public void setKeywordJson(List<String> keywordJson) {
        this.keywordJson = keywordJson;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public CommentResponse getRawResponseJson() {
        return rawResponseJson;
    }

    public void setRawResponseJson(CommentResponse rawResponseJson) {
        this.rawResponseJson = rawResponseJson;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }

    public void setAnalyzedAt(LocalDateTime analyzedAt) {
        this.analyzedAt = analyzedAt;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public String getPromptVersion() {
        return promptVersion;
    }

    public void setPromptVersion(String promptVersion) {
        this.promptVersion = promptVersion;
    }
}
