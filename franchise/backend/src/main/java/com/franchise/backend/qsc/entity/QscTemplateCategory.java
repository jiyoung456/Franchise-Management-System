package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_template_categories",
        uniqueConstraints = @UniqueConstraint(columnNames = {"template_id", "category_code"}))
public class QscTemplateCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_category_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QscTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(name = "category_code", nullable = false)
    private QscCategoryCode categoryCode; // CLEANLINESS, SERVICE, QUALITY, SAFETY

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "category_weight", nullable = false)
    private Integer categoryWeight;

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

    // QscTemplate 생성 및 수정
    public void update(String categoryName, Integer categoryWeight) {
        this.categoryName = categoryName;
        this.categoryWeight = categoryWeight;
    }

    public static QscTemplateCategory create(QscTemplate template, QscCategoryCode code, String name, Integer weight) {
        QscTemplateCategory c = new QscTemplateCategory();
        c.template = template;
        c.categoryCode = code;
        c.categoryName = name;
        c.categoryWeight = weight;
        return c;
    }

}
