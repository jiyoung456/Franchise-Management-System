package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_template_items")
public class QscTemplateItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_item_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QscTemplate template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_category_id", nullable = false)
    private QscTemplateCategory category;

    @Column(name = "item_name", nullable = false)
    private String itemName;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

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


}
