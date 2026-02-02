-- 1) enum type (없으면 생성)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'qsc_ai_status') THEN
    CREATE TYPE qsc_ai_status AS ENUM ('SUCCESS', 'FAILED');
  END IF;
END $$;

-- 2) 사진 테이블
CREATE TABLE IF NOT EXISTS qsc_inspection_photos (
  photo_id      BIGSERIAL PRIMARY KEY,
  inspection_id BIGINT NOT NULL,
  photo_url     TEXT NOT NULL,
  photo_name    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_qsc_inspection_photos_inspection
    FOREIGN KEY (inspection_id)
    REFERENCES qsc_master (inspection_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qsc_inspection_photos_inspection_id
  ON qsc_inspection_photos (inspection_id);

-- 3) AI 분석 테이블
CREATE TABLE IF NOT EXISTS qsc_photo_ai_analysis (
  analysis_id       BIGSERIAL PRIMARY KEY,
  photo_id          BIGINT,
  inspection_id     BIGINT NOT NULL,

  image_risk_score  INTEGER,
  image_tags        TEXT,    -- JSON string 또는 콤마구분 문자열 등 (일단 TEXT로)
  evidence_text     TEXT,
  status            qsc_ai_status NOT NULL DEFAULT 'SUCCESS',

  requested_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  error_message     TEXT,

  CONSTRAINT fk_qsc_photo_ai_analysis_photo
    FOREIGN KEY (photo_id)
    REFERENCES qsc_inspection_photos (photo_id)
    ON DELETE SET NULL,

  CONSTRAINT fk_qsc_photo_ai_analysis_inspection
    FOREIGN KEY (inspection_id)
    REFERENCES qsc_master (inspection_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qsc_photo_ai_analysis_inspection_id
  ON qsc_photo_ai_analysis (inspection_id);

CREATE INDEX IF NOT EXISTS idx_qsc_photo_ai_analysis_photo_id
  ON qsc_photo_ai_analysis (photo_id);
