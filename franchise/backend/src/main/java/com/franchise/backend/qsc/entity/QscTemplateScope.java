package com.franchise.backend.qsc.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "qsc_template_scope")
public class QscTemplateScope {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_scope_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QscTemplate template;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "scope_type", nullable = false, columnDefinition = "qsc_scope_type")
    private QscScopeType scopeType; // GLOBAL, REGION, STORE, DIRECT

    @Column(name = "scope_ref_id")
    private Long scopeRefId; // GLOBAL이면 null, REGION/STORE면 not null (DB 체크가 검증)

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    // QscTemplate 생성 및 수정
    public static QscTemplateScope create(QscTemplate template, QscScopeType scopeType, Long scopeRefId) {
        QscTemplateScope s = new QscTemplateScope();
        s.template = template;
        s.scopeType = scopeType;
        s.scopeRefId = scopeRefId;
        return s;
    }

}
