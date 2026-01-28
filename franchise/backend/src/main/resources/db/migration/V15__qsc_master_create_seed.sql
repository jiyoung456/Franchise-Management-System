-- =====================================================
-- QSC 점검 문항 점수 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS qsc_inspections_items (
    inspection_item_id BIGSERIAL PRIMARY KEY,

    inspection_id      BIGINT NOT NULL,
    template_item_id   BIGINT NOT NULL,   -- qsc_template_items PK
    score              INTEGER NOT NULL,  -- 1~5

    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qsc_items_master
        FOREIGN KEY (inspection_id)
        REFERENCES qsc_master(inspection_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_qsc_items_template_item
        FOREIGN KEY (template_item_id)
        REFERENCES qsc_template_items(template_item_id),

    CONSTRAINT uq_qsc_items_unique
        UNIQUE (inspection_id, template_item_id),

    CONSTRAINT chk_qsc_items_score
        CHECK (score BETWEEN 1 AND 5)
);

CREATE INDEX IF NOT EXISTS idx_qsc_items_inspection_id
    ON qsc_inspections_items(inspection_id);

CREATE INDEX IF NOT EXISTS idx_qsc_items_template_item_id
    ON qsc_inspections_items(template_item_id);


-- =====================================================
-- QSC 점검 사진 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS qsc_inspection_photos (
    photo_id       BIGSERIAL PRIMARY KEY,

    inspection_id  BIGINT NOT NULL,
    photo_url      VARCHAR(500) NOT NULL,
    photo_name     VARCHAR(255),

    created_at     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qsc_photos_master
        FOREIGN KEY (inspection_id)
        REFERENCES qsc_master(inspection_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qsc_photos_inspection_id
    ON qsc_inspection_photos(inspection_id);
