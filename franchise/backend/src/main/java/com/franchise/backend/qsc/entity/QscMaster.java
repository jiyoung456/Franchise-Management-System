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

}
