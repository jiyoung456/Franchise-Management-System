package com.franchise.backend.risk.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "risk_evidence")
public class RiskEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "risk_evidence_id")
    private Long id;

    @Column(name = "risk_snapshot_id", nullable = false)
    private Long riskSnapshotId;

    @Column(name = "category", nullable = false, length = 100)
    private String category;

    @Column(name = "evidence_text", columnDefinition = "text")
    private String evidenceText;

    @Column(name = "metric_name", length = 100)
    private String metricName;

    @Column(name = "metric_value")
    private Double metricValue;

    @Column(name = "threshold_value")
    private Double thresholdValue;

    @Column(name = "source_id", length = 30)
    private String sourceId;
}
