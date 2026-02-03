package com.franchise.backend.qscComment.entity;

import com.franchise.backend.qscComment.dto.RawResponse;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

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
    private Map<String, Object> topicJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "keyword_json", columnDefinition = "jsonb")
    private Map<String, Object> keywordJson;

    @Column(name = "summary", columnDefinition = "text")
    private String summary;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_response_json", columnDefinition = "jsonb")
    private RawResponse rawResponseJson;

    @Column(name = "model_name", nullable = false)
    private String modelName;

    @Column(name = "prompt_version", nullable = false)
    private String promptVersion;

    @Column(name = "analyzed_at", nullable = false)
    private LocalDateTime analyzedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
