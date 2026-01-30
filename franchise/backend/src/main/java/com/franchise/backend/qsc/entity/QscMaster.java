package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_master")
public class QscMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_id")
    private Long inspectionId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "inspector_id", nullable = false)
    private Long inspectorId;

    @Column(name = "inspected_at", nullable = false)
    private OffsetDateTime inspectedAt;

    // DRAFT / CONFIRMED
    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "grade", columnDefinition = "char(1)")
    private String grade;

    @Column(name = "is_passed")
    private Boolean isPassed;

    @Column(name = "needs_reinspection")
    private Boolean needsReinspection;

    @Column(name = "summary_comment")
    private String summaryComment;

    @Column(name = "confirmed_at")
    private OffsetDateTime confirmedAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * 점검 마스터 생성 (필수값 세팅)
     */
    public static QscMaster create(
            Long storeId,
            Long templateId,
            Long inspectorId,
            OffsetDateTime inspectedAt,
            String status,
            String summaryComment
    ) {
        QscMaster m = new QscMaster();
        m.storeId = storeId;
        m.templateId = templateId;
        m.inspectorId = inspectorId;
        m.inspectedAt = inspectedAt;
        m.status = status;
        m.summaryComment = summaryComment;

        // DRAFT이면 결과값들은 비워둔다(null)
        m.totalScore = null;
        m.grade = null;
        m.isPassed = null;
        m.needsReinspection = null;
        m.confirmedAt = null;

        return m;
    }

    /**
     * COMPLETED 저장 시 계산된 결과 반영
     */
    public void applyResult(
            Integer totalScore,
            String grade,
            Boolean isPassed,
            Boolean needsReinspection,
            OffsetDateTime confirmedAt
    ) {
        this.totalScore = totalScore;
        this.grade = grade;
        this.isPassed = isPassed;
        this.needsReinspection = needsReinspection;
        this.confirmedAt = confirmedAt;
    }
}
