package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_template")
public class QscTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Long id;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "template_name", nullable = false)
    private String templateName;

    @Enumerated(EnumType.STRING)
    @Column(name = "inspection_type", nullable = false)
    private QscInspectionType inspectionType; // REGULAR, SPECIAL, REINSPECTION

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom; // ✅ DATE

    @Column(name = "effective_to")
    private LocalDate effectiveTo;   // ✅ DATE (nullable)

    @Column(name = "pass_score_min", nullable = false)
    private Integer passScoreMin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private QscTemplateStatus status = QscTemplateStatus.ACTIVE;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt; // ✅ TIMESTAMPTZ

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt; // ✅ TIMESTAMPTZ

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
}


