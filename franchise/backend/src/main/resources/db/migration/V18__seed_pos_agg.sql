/* =========================================================
   V18__seed_pos_202504.sql
   - 2025-04월 POS 더미데이터 시드
   - 대상 store_id: 1,2,3,29,66,75,108
   - pos_daily: 하루 1점포 1행 (중복 없음)
   - pos_period_agg: 월(MONTH) 1행/점포 + 주(WEEK, 월~일) 1행/점포/주
   ========================================================= */

-- (선택) 랜덤 고정(매번 같은 값 나오게)
SELECT setseed(0.202504);

-- =========================================================
-- 0) 테이블/인덱스 (없으면 생성)
-- =========================================================

CREATE TABLE IF NOT EXISTS pos_daily (
    pos_daily_id     BIGSERIAL PRIMARY KEY,

    store_id         BIGINT NOT NULL REFERENCES stores(store_id),
    business_date    DATE   NOT NULL,

    sales_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
    order_count      INTEGER       NOT NULL DEFAULT 0,

    cogs_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,
    margin_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,

    is_missing       BOOLEAN NOT NULL DEFAULT FALSE,
    missing_policy   VARCHAR(30) NULL,

    is_abnormal      BOOLEAN NOT NULL DEFAULT FALSE,
    abnormal_type    VARCHAR(50) NULL,
    abnormal_reason  TEXT NULL,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pos_daily_store_date
ON pos_daily(store_id, business_date);

CREATE INDEX IF NOT EXISTS ix_pos_daily_store_date
ON pos_daily(store_id, business_date);


CREATE TABLE IF NOT EXISTS pos_period_agg (
    pos_period_agg_id   BIGSERIAL PRIMARY KEY,

    store_id            BIGINT NOT NULL REFERENCES stores(store_id),

    period_type         VARCHAR(10) NOT NULL CHECK (period_type IN ('WEEK', 'MONTH')),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,

    sales_amount        NUMERIC(18,2) NOT NULL DEFAULT 0,
    order_count         INTEGER       NOT NULL DEFAULT 0,
    aov                 NUMERIC(18,2) NOT NULL DEFAULT 0,

    cogs_amount         NUMERIC(18,2) NOT NULL DEFAULT 0,
    margin_amount       NUMERIC(18,2) NOT NULL DEFAULT 0,
    margin_rate         NUMERIC(10,4) NOT NULL DEFAULT 0,

    sales_change_rate   NUMERIC(10,4) NULL,
    order_change_rate   NUMERIC(10,4) NULL,
    aov_change_rate     NUMERIC(10,4) NULL,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pos_period_agg_store_period
ON pos_period_agg(store_id, period_type, period_start);

CREATE INDEX IF NOT EXISTS ix_pos_period_agg_store_periodstart
ON pos_period_agg(store_id, period_start);

-- =========================================================
-- 1) 기존 2025-04 데이터 삭제(대상 점포만)
-- =========================================================

DELETE FROM pos_period_agg
WHERE store_id IN (1,2,3,29,66,75,108)
  AND (
        (period_type = 'MONTH' AND period_start = DATE '2025-04-01')
     OR (period_type = 'WEEK'  AND period_start BETWEEN DATE '2025-03-31' AND DATE '2025-04-28')
  );

DELETE FROM pos_daily
WHERE store_id IN (1,2,3,29,66,75,108)
  AND business_date BETWEEN DATE '2025-04-01' AND DATE '2025-04-30';

-- =========================================================
-- 2) pos_daily: 2025-04-01 ~ 2025-04-30 생성/삽입
--    - 매장별 base 매출/주문 + 요일 가중치 + 약간의 노이즈
-- =========================================================

WITH
target_stores AS (
  SELECT store_id
  FROM (VALUES (1),(2),(3),(29),(66),(75),(108)) AS v(store_id)
),
dates AS (
  SELECT d::date AS business_date
  FROM generate_series(DATE '2025-04-01', DATE '2025-04-30', INTERVAL '1 day') AS gs(d)
),
cfg AS (
  SELECT
    ts.store_id,

    -- 매장별 기본 매출/주문(대충 가게 규모 차이 느낌)
    (1800000 + (ts.store_id % 20) * 95000)::numeric(18,2) AS base_sales,
    (120 + (ts.store_id % 15) * 7)::int                   AS base_orders
  FROM target_stores ts
),
grid AS (
  SELECT
    c.store_id,
    c.base_sales,
    c.base_orders,
    d.business_date,
    EXTRACT(ISODOW FROM d.business_date)::int AS isodow, -- 1=월 ... 7=일
    random() AS r1,
    random() AS r2,
    random() AS r3
  FROM cfg c
  CROSS JOIN dates d
),
calc AS (
  SELECT
    store_id,
    business_date,

    -- 요일 가중치(월~목 약간 낮고, 금/토/일 높음)
    CASE
      WHEN isodow IN (5) THEN 1.08
      WHEN isodow IN (6) THEN 1.18
      WHEN isodow IN (7) THEN 1.12
      ELSE 0.96
    END AS dow_mult,

    -- 노이즈(±6% 정도)
    (1.0 + ((r1 - 0.5) * 0.12)) AS noise_mult,

    base_sales,
    base_orders,
    r2,
    r3
  FROM grid
),
daily AS (
  SELECT
    store_id,
    business_date,

    -- 결측은 이번 V18에서는 만들지 않음(테스트 용이)
    FALSE AS is_missing,
    NULL::varchar AS missing_policy,

    FALSE AS is_abnormal,
    NULL::varchar AS abnormal_type,
    NULL::text AS abnormal_reason,

    -- 매출/주문
    ROUND((base_sales * dow_mult * noise_mult)::numeric, 2) AS sales_amount,
    GREATEST(1, ROUND((base_orders * dow_mult * (1.0 + ((r2 - 0.5) * 0.10)))::numeric, 0)::int) AS order_count,

    -- 원가/마진(대충 마진율 30~38% 근처)
    -- cogs_rate = 0.62 ~ 0.70 정도
    (0.62 + (r3 * 0.08))::numeric AS cogs_rate
  FROM calc
)
INSERT INTO pos_daily (
  store_id, business_date,
  sales_amount, order_count,
  cogs_amount, margin_amount,
  is_missing, missing_policy,
  is_abnormal, abnormal_type, abnormal_reason,
  created_at, updated_at
)
SELECT
  store_id,
  business_date,
  sales_amount,
  order_count,
  ROUND((sales_amount * cogs_rate)::numeric, 2) AS cogs_amount,
  ROUND((sales_amount - (sales_amount * cogs_rate))::numeric, 2) AS margin_amount,
  is_missing,
  missing_policy,
  is_abnormal,
  abnormal_type,
  abnormal_reason,
  NOW(), NOW()
FROM daily
ORDER BY store_id, business_date;

-- =========================================================
-- 3) pos_period_agg: MONTH(2025-04) 생성
-- =========================================================

INSERT INTO pos_period_agg (
  store_id, period_type, period_start, period_end,
  sales_amount, order_count, aov,
  cogs_amount, margin_amount, margin_rate,
  sales_change_rate, order_change_rate, aov_change_rate,
  created_at
)
SELECT
  p.store_id,
  'MONTH' AS period_type,
  DATE '2025-04-01' AS period_start,
  DATE '2025-04-30' AS period_end,

  ROUND(COALESCE(SUM(p.sales_amount), 0)::numeric, 2) AS sales_amount,
  COALESCE(SUM(p.order_count), 0)::int AS order_count,

  -- AOV = sales / orders
  ROUND(
    CASE WHEN COALESCE(SUM(p.order_count), 0) = 0 THEN 0
         ELSE (SUM(p.sales_amount) / SUM(p.order_count))::numeric
    END
  , 2) AS aov,

  ROUND(COALESCE(SUM(p.cogs_amount), 0)::numeric, 2) AS cogs_amount,
  ROUND(COALESCE(SUM(p.margin_amount), 0)::numeric, 2) AS margin_amount,

  -- margin_rate = margin / sales
  ROUND(
    CASE WHEN COALESCE(SUM(p.sales_amount), 0) = 0 THEN 0
         ELSE (SUM(p.margin_amount) / SUM(p.sales_amount))::numeric
    END
  , 4) AS margin_rate,

  NULL::numeric AS sales_change_rate,
  NULL::numeric AS order_change_rate,
  NULL::numeric AS aov_change_rate,

  NOW()
FROM pos_daily p
WHERE p.store_id IN (1,2,3,29,66,75,108)
  AND p.business_date BETWEEN DATE '2025-04-01' AND DATE '2025-04-30'
GROUP BY p.store_id
ON CONFLICT (store_id, period_type, period_start) DO UPDATE SET
  period_end       = EXCLUDED.period_end,
  sales_amount     = EXCLUDED.sales_amount,
  order_count      = EXCLUDED.order_count,
  aov              = EXCLUDED.aov,
  cogs_amount      = EXCLUDED.cogs_amount,
  margin_amount    = EXCLUDED.margin_amount,
  margin_rate      = EXCLUDED.margin_rate,
  sales_change_rate= EXCLUDED.sales_change_rate,
  order_change_rate= EXCLUDED.order_change_rate,
  aov_change_rate  = EXCLUDED.aov_change_rate;

-- =========================================================
-- 4) pos_period_agg: WEEK(월~일) 생성
--    - week_start = date_trunc('week', business_date)::date  (Postgres는 주 시작이 월요일)
--    - 4월 데이터만 합산하지만, period_start/period_end는 "월~일" 경계로 표시
-- =========================================================

INSERT INTO pos_period_agg (
  store_id, period_type, period_start, period_end,
  sales_amount, order_count, aov,
  cogs_amount, margin_amount, margin_rate,
  sales_change_rate, order_change_rate, aov_change_rate,
  created_at
)
SELECT
  p.store_id,
  'WEEK' AS period_type,
  date_trunc('week', p.business_date)::date AS period_start,
  (date_trunc('week', p.business_date)::date + 6) AS period_end,

  ROUND(COALESCE(SUM(p.sales_amount), 0)::numeric, 2) AS sales_amount,
  COALESCE(SUM(p.order_count), 0)::int AS order_count,

  ROUND(
    CASE WHEN COALESCE(SUM(p.order_count), 0) = 0 THEN 0
         ELSE (SUM(p.sales_amount) / SUM(p.order_count))::numeric
    END
  , 2) AS aov,

  ROUND(COALESCE(SUM(p.cogs_amount), 0)::numeric, 2) AS cogs_amount,
  ROUND(COALESCE(SUM(p.margin_amount), 0)::numeric, 2) AS margin_amount,

  ROUND(
    CASE WHEN COALESCE(SUM(p.sales_amount), 0) = 0 THEN 0
         ELSE (SUM(p.margin_amount) / SUM(p.sales_amount))::numeric
    END
  , 4) AS margin_rate,

  NULL::numeric AS sales_change_rate,
  NULL::numeric AS order_change_rate,
  NULL::numeric AS aov_change_rate,

  NOW()
FROM pos_daily p
WHERE p.store_id IN (1,2,3,29,66,75,108)
  AND p.business_date BETWEEN DATE '2025-04-01' AND DATE '2025-04-30'
GROUP BY p.store_id, date_trunc('week', p.business_date)::date
ON CONFLICT (store_id, period_type, period_start) DO UPDATE SET
  period_end       = EXCLUDED.period_end,
  sales_amount     = EXCLUDED.sales_amount,
  order_count      = EXCLUDED.order_count,
  aov              = EXCLUDED.aov,
  cogs_amount      = EXCLUDED.cogs_amount,
  margin_amount    = EXCLUDED.margin_amount,
  margin_rate      = EXCLUDED.margin_rate,
  sales_change_rate= EXCLUDED.sales_change_rate,
  order_change_rate= EXCLUDED.order_change_rate,
  aov_change_rate  = EXCLUDED.aov_change_rate;
