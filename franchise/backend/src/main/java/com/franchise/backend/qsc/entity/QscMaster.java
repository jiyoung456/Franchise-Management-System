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

    @Column(name = "grade", columnDefinition = "char(1)", nullable = false)
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

    // 생성용 편의 메서드 (서비스에서 사용)
    public static QscMaster create(Long storeId, Long templateId, Long inspectorId,
                                   OffsetDateTime inspectionDate, String status, String summaryComment) {
        QscMaster m = new QscMaster();
        m.storeId = storeId;
        m.templateId = templateId;
        m.inspectorId = inspectorId;
        m.inspectionDate = inspectionDate;
        m.status = status;
        m.summaryComment = summaryComment;
        return m;
    }

    public void applyResult(Integer totalScore, String grade, boolean isPassed, boolean needsReinspection, OffsetDateTime confirmedAt) {
        this.totalScore = totalScore;
        this.grade = grade;
        this.isPassed = isPassed;
        this.needsReinspection = needsReinspection;
        this.confirmedAt = confirmedAt;
    }
}
