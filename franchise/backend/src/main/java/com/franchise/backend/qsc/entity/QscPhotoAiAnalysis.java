package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_photo_ai_analysis")
public class QscPhotoAiAnalysis {

    public enum Status { SUCCESS, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "analysis_id")
    private Long analysisId;

    @Column(name = "photo_id")
    private Long photoId;

    @Column(name = "inspection_id", nullable = false)
    private Long inspectionId;

    @Column(name = "image_risk_score")
    private Integer imageRiskScore;

    @Column(name = "image_tags")
    private String imageTags; // JSON string 형태로 저장중

    @Column(name = "evidence_text")
    private String evidenceText;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status;

    @Column(name = "requested_at", nullable = false)
    private OffsetDateTime requestedAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @Column(name = "error_message")
    private String errorMessage;
}
