package com.franchise.backend.qscComment.entity;

import com.franchise.backend.qscComment.dto.QscCommentRequest;
import com.franchise.backend.qscComment.dto.QscCommentResponse;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "qsc_comment_analysis")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QscCommentAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "inspection_id", nullable = false)
    private Long inspectionId;

    @Column(name = "source_text", columnDefinition = "text", nullable = false)
    private String sourceText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "topic_json", columnDefinition = "jsonb")
    private List<String> topicJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "keyword_json", columnDefinition = "jsonb")
    private List<String> keywordJson;

    @Column(name = "summary", columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response_json", columnDefinition = "jsonb")
    private QscCommentRequest rawResponseJson;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "prompt_version", nullable = false)
    private String promptVersion;

    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public QscCommentAnalysis(
            QscCommentRequest request,
            QscCommentResponse response
    ) {
        this.inspectionId = request.getInspectionId();
        this.sourceText = request.getSummaryComment();
        this.topicJson = response.getTopicJson();
        this.keywordJson = response.getKeywordJson();
        this.summary = response.getSummary();
        this.rawResponseJson = request;
        this.modelName = response.getModelName();
        this.promptVersion = response.getPromptVersion();
        this.analyzedAt = response.getAnalyzedAt();
        this.createdAt = LocalDateTime.now();
    }
}
