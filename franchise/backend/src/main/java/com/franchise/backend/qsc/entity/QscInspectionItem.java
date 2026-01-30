package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_inspections_items",
        uniqueConstraints = @UniqueConstraint(columnNames = {"inspection_id", "template_item_id"}))
public class QscInspectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inspection_item_id")
    private Long id;

    @Column(name = "inspection_id", nullable = false)
    private Long inspectionId;

    @Column(name = "template_item_id", nullable = false)
    private Long templateItemId;

    @Column(name = "score", nullable = false)
    private Integer score; // 1~5

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    public static QscInspectionItem create(Long inspectionId, Long templateItemId, Integer score) {
        QscInspectionItem i = new QscInspectionItem();
        i.inspectionId = inspectionId;
        i.templateItemId = templateItemId;
        i.score = score;
        return i;
    }
}
