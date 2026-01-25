-- =====================================================
-- QSC 점검 마스터 테이블
-- =====================================================
CREATE TABLE qsc_master (
    inspection_id      BIGSERIAL PRIMARY KEY,

    store_id           BIGINT NOT NULL,       -- 점검 대상 점포
    template_id        BIGINT NOT NULL,       -- 점검 템플릿 ID (향후 확장용)
    inspector_id       BIGINT NOT NULL,       -- 점검자 (users.user_id)

    inspected_at       TIMESTAMPTZ NOT NULL,  -- 점검 실시 일시

    status             VARCHAR(20) NOT NULL, -- DRAFT / COMPLETED
    total_score        INTEGER NOT NULL,      -- 총점 (0~100)

    grade              CHAR(1) NOT NULL,      -- S / A / B / C / D

    is_passed          BOOLEAN NOT NULL,      -- 합격 여부
    needs_reinspection BOOLEAN NOT NULL,      -- 재점검 여부

    summary_comment    TEXT,                  -- 점검 요약 코멘트

    confirmed_at       TIMESTAMPTZ,            -- 확정 일시
    created_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qsc_store
        FOREIGN KEY (store_id)
        REFERENCES stores(store_id),

    CONSTRAINT fk_qsc_inspector
        FOREIGN KEY (inspector_id)
        REFERENCES users(user_id)
);

-- 조회 성능용 인덱스
CREATE INDEX idx_qsc_store_id ON qsc_master(store_id);
CREATE INDEX idx_qsc_inspected_at ON qsc_master(inspected_at DESC);
