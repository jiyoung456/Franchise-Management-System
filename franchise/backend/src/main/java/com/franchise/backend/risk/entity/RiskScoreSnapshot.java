package com.franchise.backend.risk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.LocalDate;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "risk_score_snapshot")
public class RiskScoreSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_snapshot_id")
    private Long id;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "anomaly_intensity")
    private Double anomalyIntensity;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false)
    private RiskLevel riskLevel;

    @Column(name = "risk_base_date")
    private LocalDate riskBaseDate;

    @Column(name = "status_changed", nullable = false)
    private Boolean statusChanged;

    @Column(name = "risk_created_at", nullable = false)
    private OffsetDateTime riskCreatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.riskCreatedAt == null) {
            this.riskCreatedAt = OffsetDateTime.now();
        }
        if (this.statusChanged == null) {
            this.statusChanged = false;
        }
    }
}
