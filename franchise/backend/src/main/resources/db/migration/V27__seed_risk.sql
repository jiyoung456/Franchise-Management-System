-- Seed risk_score_snapshot + risk_evidence
-- Range: 2025-03-01 ~ 2025-08-31
-- Requires: stores(store_id) exists

-- 0) idempotent cleanup (only for the target period)
WITH target_snapshots AS (
  SELECT risk_snapshot_id
  FROM risk_score_snapshot
  WHERE risk_base_date BETWEEN DATE '2025-03-01' AND DATE '2025-08-31'
)
DELETE FROM risk_evidence e
USING target_snapshots t
WHERE e.risk_snapshot_id = t.risk_snapshot_id;

DELETE FROM risk_score_snapshot
WHERE risk_base_date BETWEEN DATE '2025-03-01' AND DATE '2025-08-31';


-- 1) build monthly snapshots for every store
WITH months AS (
  SELECT generate_series(DATE '2025-03-01', DATE '2025-08-01', INTERVAL '1 month')::date AS base_date
),
base AS (
  SELECT
    s.store_id,
    m.base_date,
    -- deterministic pseudo-random 0..99 based on store_id + month
    (abs(hashtext(s.store_id::text || '-' || to_char(m.base_date, 'YYYYMM'))) % 100) AS r
  FROM stores s
  CROSS JOIN months m
  WHERE s.deleted_at IS NULL
),
assigned AS (
  SELECT
    store_id,
    base_date,
    CASE
      WHEN r < 70 THEN 'NORMAL'
      WHEN r < 90 THEN 'WATCHLIST'
      ELSE 'RISK'
    END AS risk_level,
    -- 0.0 ~ 2.49 정도로 분포
    round(((r % 250)::numeric / 100), 2)::double precision AS anomaly_intensity,
    -- 생성 시각을 월 중순으로 통일 (표본 확인하기 쉬움)
    (base_date + INTERVAL '14 days' + INTERVAL '09:00')::timestamptz AS risk_created_at
  FROM base
),
with_change AS (
  SELECT
    store_id,
    base_date,
    risk_level,
    anomaly_intensity,
    risk_created_at,
    CASE
      WHEN lag(risk_level) OVER (PARTITION BY store_id ORDER BY base_date) IS NULL THEN FALSE
      WHEN lag(risk_level) OVER (PARTITION BY store_id ORDER BY base_date) <> risk_level THEN TRUE
      ELSE FALSE
    END AS status_changed
  FROM assigned
),
inserted AS (
  INSERT INTO risk_score_snapshot (
    store_id,
    anomaly_intensity,
    risk_level,
    risk_base_date,
    status_changed,
    risk_created_at
  )
  SELECT
    store_id,
    anomaly_intensity,
    risk_level,
    base_date,
    status_changed,
    risk_created_at
  FROM with_change
  RETURNING risk_snapshot_id, store_id, risk_level, risk_base_date
)

-- 2) attach evidences (1~3 rows per snapshot, level-based categories)
INSERT INTO risk_evidence (
  risk_snapshot_id,
  category,
  evidence_text,
  metric_name,
  metric_value,
  threshold_value,
  source_id
)
SELECT
  i.risk_snapshot_id,
  e.category,
  e.evidence_text,
  e.metric_name,
  e.metric_value,
  e.threshold_value,
  e.source_id
FROM inserted i
CROSS JOIN LATERAL (
  -- NORMAL: 1개(가볍게), WATCHLIST: 2개, RISK: 3개
  SELECT *
  FROM (
    VALUES
      -- 공통/가벼운
      ('위험 등급 지정', '리스크 레벨이 산정되었습니다.', 'risk_level', NULL::double precision, NULL::double precision, 'system'),

      -- WATCHLIST/RISK에 자주 등장하게 만들 TOP 카테고리 후보들
      ('QSC 점수 미달', '최근 점검 점수가 기준보다 낮습니다.', 'qsc_score', 72.0, 80.0, 'qsc'),
      ('관찰 대상 지정', '최근 지표 변동으로 관찰 대상입니다.', 'volatility', 1.4, 1.0, 'system'),
      ('위생 항목 미흡', '위생 관련 항목에서 반복 미흡이 감지되었습니다.', 'hygiene_flags', 3.0, 1.0, 'qsc'),
      ('고객 컴플레인 증가', '고객 컴플레인이 증가 추세입니다.', 'complaints', 12.0, 5.0, 'manual'),
      ('매출 이상 징후', '매출 패턴에서 이상 징후가 감지되었습니다.', 'sales_anomaly', 1.8, 1.0, 'pos')
  ) v(category, evidence_text, metric_name, metric_value, threshold_value, source_id)
  WHERE
    (i.risk_level = 'NORMAL' AND v.category IN ('위험 등급 지정'))
    OR
    (i.risk_level = 'WATCHLIST' AND v.category IN ('QSC 점수 미달', '관찰 대상 지정'))
    OR
    (i.risk_level = 'RISK' AND v.category IN ('QSC 점수 미달', '위생 항목 미흡', '매출 이상 징후'))
) e;
