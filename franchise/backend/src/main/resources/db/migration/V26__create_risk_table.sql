-- V__create_risk_tables.sql

CREATE TABLE risk_score_snapshot (
    risk_snapshot_id      BIGSERIAL PRIMARY KEY,

    store_id              BIGINT NOT NULL,
    anomaly_intensity     DOUBLE PRECISION,
    risk_level            VARCHAR(20) NOT NULL,     -- e.g. NORMAL / WARNING / DANGER
    risk_base_date        DATE,
    status_changed        BOOLEAN NOT NULL DEFAULT FALSE,
    risk_created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_risk_snapshot_store
        FOREIGN KEY (store_id)
        REFERENCES stores(store_id)
);

CREATE INDEX idx_risk_snapshot_store_created
    ON risk_score_snapshot (store_id, risk_created_at DESC);

CREATE INDEX idx_risk_snapshot_level
    ON risk_score_snapshot (risk_level);


CREATE TABLE risk_evidence (
    risk_evidence_id      BIGSERIAL PRIMARY KEY,

    risk_snapshot_id      BIGINT NOT NULL,
    category              VARCHAR(100) NOT NULL,    -- e.g. "QSC 점수 미달", "관찰 대상 지정" ...
    evidence_text         TEXT,
    metric_name           VARCHAR(100),
    metric_value          DOUBLE PRECISION,
    threshold_value       DOUBLE PRECISION,
    source_id             VARCHAR(30),              -- e.g. qsc / pos / manual / ai

    CONSTRAINT fk_risk_evidence_snapshot
        FOREIGN KEY (risk_snapshot_id)
        REFERENCES risk_score_snapshot(risk_snapshot_id)
        ON DELETE CASCADE
);

CREATE INDEX idx_risk_evidence_snapshot
    ON risk_evidence (risk_snapshot_id);

CREATE INDEX idx_risk_evidence_category
    ON risk_evidence (category);

CREATE INDEX idx_risk_evidence_source
    ON risk_evidence (source_id);
