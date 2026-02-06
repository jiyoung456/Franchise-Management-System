package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

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
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "inspection_type", nullable = false, columnDefinition = "qsc_inspection_type")
    private QscInspectionType inspectionType;
    // REGULAR, SPECIAL, REINSPECTION

    @Column(name = "version", nullable = false)
    private String version;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom; // ✅ DATE

    @Column(name = "effective_to")
    private LocalDate effectiveTo;   // ✅ DATE (nullable)

    @Column(name = "pass_score_min", nullable = false)
    private Integer passScoreMin;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false, columnDefinition = "qsc_template_status")
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

    // QscTemplate 생성 및 수정
    public void updateBasic(
            String templateName,
            QscInspectionType inspectionType,
            String version,
            java.time.LocalDate effectiveFrom,
            java.time.LocalDate effectiveTo,
            Integer passScoreMin,
            QscTemplateStatus status
    ) {
        this.templateName = templateName;
        this.inspectionType = inspectionType;
        this.version = version;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.passScoreMin = passScoreMin;
        if (status != null) this.status = status;
    }

    public static QscTemplate create(
            Long createdByUserId,
            String templateName,
            QscInspectionType inspectionType,
            String version,
            java.time.LocalDate effectiveFrom,
            java.time.LocalDate effectiveTo,
            Integer passScoreMin,
            QscTemplateStatus status
    ) {
        QscTemplate t = new QscTemplate();
        t.createdByUserId = createdByUserId;
        t.templateName = templateName;
        t.inspectionType = inspectionType;
        t.version = version;
        t.effectiveFrom = effectiveFrom;
        t.effectiveTo = effectiveTo;
        t.passScoreMin = passScoreMin;
        t.status = (status == null ? QscTemplateStatus.ACTIVE : status);
        return t;
    }

}


