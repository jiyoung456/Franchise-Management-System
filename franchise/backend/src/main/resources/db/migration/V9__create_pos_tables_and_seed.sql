/* =========================================================
   V9__create_pos_tables_and_seed.sql
   - POS 관련 테이블 생성 + POS_DAILY 더미데이터 시드
   ========================================================= */

-- =========================================================
-- 0) POS 관련 테이블 생성
-- =========================================================

-- 0-1) pos_daily (POS 일 단위 원천/집계)
CREATE TABLE IF NOT EXISTS pos_daily (
    pos_daily_id     BIGSERIAL PRIMARY KEY,

    store_id         BIGINT NOT NULL REFERENCES stores(store_id),
    business_date    DATE   NOT NULL,

    sales_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,
    order_count      INTEGER       NOT NULL DEFAULT 0,

    cogs_amount      NUMERIC(18,2) NOT NULL DEFAULT 0,
    margin_amount    NUMERIC(18,2) NOT NULL DEFAULT 0,

    is_missing       BOOLEAN NOT NULL DEFAULT FALSE,
    missing_policy   VARCHAR(30) NULL,                 -- 예: ZERO_FILL

    is_abnormal      BOOLEAN NOT NULL DEFAULT FALSE,
    abnormal_type    VARCHAR(50) NULL,                 -- 예: SALES_SPIKE/SALES_DROP/OPERATION_ISSUE 등
    abnormal_reason  TEXT NULL,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pos_daily_store_date
ON pos_daily(store_id, business_date);

CREATE INDEX IF NOT EXISTS ix_pos_daily_store_date
ON pos_daily(store_id, business_date);


-- 0-2) pos_period_agg (주/월 KPI 집계)
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


-- 0-3) pos_menu_period_agg (메뉴 단위 집계/보조)
CREATE TABLE IF NOT EXISTS pos_menu_period_agg (
    menu_pert_id     BIGSERIAL PRIMARY KEY,

    store_id         BIGINT NOT NULL REFERENCES stores(store_id),

    period_type      VARCHAR(10) NOT NULL CHECK (period_type IN ('WEEK', 'MONTH')),
    period_start     DATE NOT NULL,
    period_end       DATE NOT NULL,

    menu_name        VARCHAR(200) NOT NULL,
    quantity_sold    INTEGER NOT NULL DEFAULT 0,
    sales_amount     NUMERIC(18,2) NOT NULL DEFAULT 0,

    menu_active      BOOLEAN NOT NULL DEFAULT TRUE,

    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pos_menu_period_agg_key
ON pos_menu_period_agg(store_id, period_type, period_start, menu_name);

CREATE INDEX IF NOT EXISTS ix_pos_menu_period_agg_store_period
ON pos_menu_period_agg(store_id, period_start);


-- 0-4) pos_baseline (기준선 / 이상탐지 기준 관리)
CREATE TABLE IF NOT EXISTS pos_baseline (
    pos_baseline_id   BIGSERIAL PRIMARY KEY,

    store_id          BIGINT NOT NULL REFERENCES stores(store_id),

    period_type       VARCHAR(10) NOT NULL CHECK (period_type IN ('WEEK', 'MONTH')),
    metric            VARCHAR(20) NOT NULL CHECK (metric IN ('SALES', 'ORDER_COUNT', 'AOV', 'MARGIN_RATE')),

    baseline_value    NUMERIC(18,4) NOT NULL,
    threshold_rate    NUMERIC(10,4) NOT NULL,

    version           INTEGER NOT NULL DEFAULT 1,

    effective_from    DATE NOT NULL,
    effective_to      DATE NULL,

    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pos_baseline_key
ON pos_baseline(store_id, period_type, metric, version);

CREATE INDEX IF NOT EXISTS ix_pos_baseline_store_metric
ON pos_baseline(store_id, metric);


-- =========================================================
-- 1) POS_DAILY 더미데이터 (너가 준 것 그대로)
-- =========================================================

-- =========================================================
-- 0) 기존 데이터 삭제 (ID 시퀀스 초기화)
-- =========================================================
TRUNCATE TABLE pos_daily RESTART IDENTITY;

-- =========================================================
-- 1) 더미 데이터 생성/삽입
--    기간: 2025-03-01 ~ 2025-08-31
--    대상 store_id: 사용자가 지정한 NORMAL 스토어 풀
-- =========================================================
WITH
target_stores AS (
  SELECT store_id
  FROM (VALUES
    (4),(5),(7),(9),(10),(11),(12),(15),(16),(17),(19),(20),(21),(22),(24),(25),
    (27),(29),(30),(31),(32),(34),(36),(37),(38),(41),(42),(44),(46),(47),(50),
    (51),(52),(53),(56),(57),(58),(59),(61),(63),(64),(66),(67),(70),(71),(72),
    (75),(76),(82),(83),(85),(86),(87),(89),(91),(92),(93),(95),(97),(98),(101),
    (102),(104),(105),(107),(109),(110),(112),(114),(115),(116),(117),(119),(120)
  ) AS v(store_id)
),

dates AS (
  SELECT d::date AS business_date
  FROM generate_series('2025-03-01'::date, '2025-08-31'::date, '1 day') AS g(d)
),

store_cfg AS (
  SELECT
    s.store_id,
    CASE
      WHEN s.store_id IN (21,47,72,110,117) THEN 'B'
      WHEN s.store_id % 7 = 0 THEN 'B'
      ELSE 'A'
    END AS pattern_type,
    CASE
      WHEN s.store_id = 7  THEN 'sto_0007: 안정 성장'
      WHEN s.store_id = 12 THEN 'sto_0012: 4월 매출 급락(공사/리모델링 컨셉)'
      WHEN s.store_id = 21 THEN 'sto_0021: 주말형 매장'
      WHEN s.store_id IN (47,72,110,117) THEN '주말 강세 + 변동성 있는 매장'
      WHEN s.store_id % 7 = 0 THEN '프로모션/주변 이슈로 간헐적 변동'
      ELSE '안정 운영(기준 데이터)'
    END AS story_memo,

    ( 1800000 + (s.store_id % 20) * 85000 )::numeric(18,2) AS base_sales,
    ( 140 + (s.store_id % 18) * 6 )::int AS base_orders,

    CASE
      WHEN s.store_id = 7 THEN 0.0009
      WHEN s.store_id % 11 = 0 THEN -0.0003
      ELSE 0.0004
    END AS daily_trend
  FROM target_stores s
),

base_grid AS (
  SELECT
    c.store_id,
    c.pattern_type,
    c.story_memo,
    c.base_sales,
    c.base_orders,
    c.daily_trend,
    d.business_date,
    EXTRACT(DOW FROM d.business_date) AS dow,
    (d.business_date - '2025-03-01'::date) AS day_idx
  FROM store_cfg c
  CROSS JOIN dates d
),

rand AS (
  SELECT
    g.*,
    random() AS r_missing,
    random() AS r_abn,
    random() AS r_abn_kind,
    random() AS r_noise,
    random() AS r_cogs
  FROM base_grid g
),

flags AS (
  SELECT
    r.*,
    (r.r_missing < CASE WHEN r.pattern_type='A' THEN 0.010 ELSE 0.020 END) AS is_missing,
    (r.r_abn < CASE WHEN r.pattern_type='A' THEN 0.005 ELSE 0.015 END) AS is_abnormal,
    CASE
      WHEN (r.r_abn < CASE WHEN r.pattern_type='A' THEN 0.005 ELSE 0.015 END) AND r.r_abn_kind < 0.5
        THEN 'SALES_SPIKE'
      WHEN (r.r_abn < CASE WHEN r.pattern_type='A' THEN 0.005 ELSE 0.015 END)
        THEN 'SALES_DROP'
      ELSE NULL
    END AS abnormal_type,
    CASE
      WHEN (r.r_abn < CASE WHEN r.pattern_type='A' THEN 0.005 ELSE 0.015 END) AND r.r_abn_kind < 0.5
        THEN '비정상 매출 급증(프로모션/단체주문 가정)'
      WHEN (r.r_abn < CASE WHEN r.pattern_type='A' THEN 0.005 ELSE 0.015 END)
        THEN '비정상 매출 급락(임시 휴점/기상/공사 가정)'
      ELSE NULL
    END AS abnormal_reason
  FROM rand r
),

mults AS (
  SELECT
    f.*,
    CASE
      WHEN f.pattern_type='B' AND f.dow IN (6,0) THEN 1.45
      WHEN f.pattern_type='B' AND f.dow = 5 THEN 1.20
      WHEN f.pattern_type='B' AND f.dow IN (1,2,3,4) THEN 0.88
      WHEN f.pattern_type='A' AND f.dow IN (6,0) THEN 1.18
      WHEN f.pattern_type='A' AND f.dow = 5 THEN 1.08
      ELSE 0.96
    END AS dow_mult,

    CASE
      WHEN f.store_id=12 AND f.business_date BETWEEN '2025-04-01'::date AND '2025-04-20'::date THEN 0.60
      ELSE 1.00
    END AS special_mult,

    (1 + (f.daily_trend * f.day_idx)) AS trend_mult,

    CASE
      WHEN f.pattern_type='A' THEN (1 + (f.r_noise - 0.5) * 0.06)
      ELSE (1 + (f.r_noise - 0.5) * 0.14)
    END AS noise_mult
  FROM flags f
),

calc AS (
  SELECT
    store_id,
    business_date,
    is_missing,
    is_abnormal,
    abnormal_type,
    abnormal_reason,
    CASE WHEN is_missing THEN 'ZERO_FILL' ELSE NULL END AS missing_policy,
    r_cogs,

    -- sales_amount (numeric)
    CASE
      WHEN is_missing THEN 0::numeric(18,2)
      ELSE
        ROUND(
          (
            base_sales
            * dow_mult
            * special_mult
            * trend_mult
            * noise_mult
            * CASE
                WHEN is_abnormal AND abnormal_type='SALES_SPIKE' THEN 1.80
                WHEN is_abnormal AND abnormal_type='SALES_DROP'  THEN 0.45
                ELSE 1.00
              END
          )::numeric
        , 2)
    END AS sales_amount,

    -- order_count
    CASE
      WHEN is_missing THEN 0
      ELSE
        GREATEST(
          1,
          ROUND(
            (
              base_orders
              * dow_mult
              * special_mult
              * trend_mult
              * (CASE WHEN noise_mult < 0.5 THEN 0.5 ELSE noise_mult END)
              * CASE
                  WHEN is_abnormal AND abnormal_type='SALES_SPIKE' THEN 1.50
                  WHEN is_abnormal AND abnormal_type='SALES_DROP'  THEN 0.55
                  ELSE 1.00
                END
            )::numeric
          )::int
        )
    END AS order_count
  FROM mults
),

with_cogs AS (
  SELECT
    store_id,
    business_date,
    sales_amount,
    order_count,
    is_missing,
    missing_policy,
    is_abnormal,
    abnormal_type,
    abnormal_reason,

    -- ROUND 전에 numeric 캐스팅
    CASE
      WHEN sales_amount = 0 THEN 0::numeric(18,2)
      ELSE ROUND( (sales_amount * (0.54 + (r_cogs * 0.06)))::numeric , 2)
    END AS cogs_amount
  FROM calc
)

INSERT INTO pos_daily (
  store_id,
  business_date,
  sales_amount,
  order_count,
  cogs_amount,
  margin_amount,
  is_missing,
  missing_policy,
  is_abnormal,
  abnormal_type,
  abnormal_reason
)
SELECT
  store_id,
  business_date,
  sales_amount,
  order_count,
  cogs_amount,
  ROUND((sales_amount - cogs_amount)::numeric, 2) AS margin_amount,
  is_missing,
  missing_policy,
  is_abnormal,
  abnormal_type,
  abnormal_reason
FROM with_cogs
ORDER BY store_id, business_date;


-- ============================================================
-- POS_DAILY 더미데이터 생성 : 2025-03-01 ~ 2025-08-31 (C그룹)
-- (A) RISK 급락 3일 구간(D-1~D+1) abnormal 처리
-- (B) WATCHLIST 소규모 이슈 2일 구간(점포별 1회) 추가 + abnormal 처리
-- ============================================================

SELECT setseed(0.42);

DELETE FROM pos_daily
WHERE store_id IN (
  6, 28, 45, 65, 74, 84,
  3, 8, 14, 23, 26, 33, 39, 43, 48, 54, 62, 69, 78, 81
)
AND business_date BETWEEN DATE '2025-03-01' AND DATE '2025-08-31';

WITH
store_params AS (
  SELECT *
  FROM (VALUES
    -- RISK 6개: 급락일 점포별 상이
    ( 6 , 'RISK'     , 2400000::numeric, 110::int, 0.35::numeric, DATE '2025-06-18'),
    (28 , 'RISK'     , 2200000::numeric, 100::int, 0.34::numeric, DATE '2025-07-09'),
    (45 , 'RISK'     , 2600000::numeric, 120::int, 0.33::numeric, DATE '2025-05-27'),
    (65 , 'RISK'     , 2100000::numeric,  95::int, 0.36::numeric, DATE '2025-08-05'),
    (74 , 'RISK'     , 2300000::numeric, 105::int, 0.32::numeric, DATE '2025-06-02'),
    (84 , 'RISK'     , 2500000::numeric, 115::int, 0.34::numeric, DATE '2025-07-22'),

    -- WATCHLIST 14개 (shock_date NULL)
    ( 3 , 'WATCHLIST', 2400000::numeric, 115::int, 0.35::numeric, NULL::date),
    ( 8 , 'WATCHLIST', 2600000::numeric, 125::int, 0.34::numeric, NULL::date),
    (14 , 'WATCHLIST', 2000000::numeric,  92::int, 0.36::numeric, NULL::date),
    (23 , 'WATCHLIST', 2200000::numeric, 100::int, 0.35::numeric, NULL::date),
    (26 , 'WATCHLIST', 2100000::numeric,  98::int, 0.33::numeric, NULL::date),
    (33 , 'WATCHLIST', 2300000::numeric, 108::int, 0.34::numeric, NULL::date),
    (39 , 'WATCHLIST', 1900000::numeric,  88::int, 0.36::numeric, NULL::date),
    (43 , 'WATCHLIST', 2500000::numeric, 118::int, 0.33::numeric, NULL::date),
    (48 , 'WATCHLIST', 2050000::numeric,  95::int, 0.35::numeric, NULL::date),
    (54 , 'WATCHLIST', 2150000::numeric,  98::int, 0.34::numeric, NULL::date),
    (62 , 'WATCHLIST', 2250000::numeric, 105::int, 0.35::numeric, NULL::date),
    (69 , 'WATCHLIST', 1950000::numeric,  90::int, 0.36::numeric, NULL::date),
    (78 , 'WATCHLIST', 2350000::numeric, 110::int, 0.34::numeric, NULL::date),
    (81 , 'WATCHLIST', 2450000::numeric, 116::int, 0.33::numeric, NULL::date)
  ) AS t(store_id, group_type, base_sales, base_orders, base_margin_rate, shock_date)
),

dates AS (
  SELECT d::date AS business_date
  FROM generate_series(DATE '2025-03-01', DATE '2025-08-31', INTERVAL '1 day') AS gs(d)
),

month_factor AS (
  SELECT
    sp.store_id,
    sp.group_type,
    d.business_date,
    CASE
      WHEN sp.group_type = 'WATCHLIST' THEN
        CASE EXTRACT(MONTH FROM d.business_date)::int
          WHEN 3 THEN 1.00
          WHEN 4 THEN 0.95
          WHEN 5 THEN 0.80
          WHEN 6 THEN 0.76
          WHEN 7 THEN 0.72
          WHEN 8 THEN 0.68
        END
      WHEN sp.group_type = 'RISK' THEN
        CASE EXTRACT(MONTH FROM d.business_date)::int
          WHEN 3 THEN 1.00
          WHEN 4 THEN 0.93
          WHEN 5 THEN 0.74
          WHEN 6 THEN 0.70
          WHEN 7 THEN 0.66
          WHEN 8 THEN 0.62
        END
    END AS factor
  FROM store_params sp
  CROSS JOIN dates d
),

raw_daily AS (
  SELECT
    mf.store_id,
    mf.business_date,
    mf.group_type,
    sp.base_sales,
    sp.base_orders,
    sp.base_margin_rate,
    sp.shock_date,
    mf.factor,

    CASE WHEN EXTRACT(ISODOW FROM mf.business_date) IN (6,7) THEN 1.06 ELSE 1.00 END AS weekend_boost,

    -- 결측 확률(불안정 운영) : WATCHLIST > RISK
    CASE
      WHEN mf.group_type='WATCHLIST' THEN (random() < 0.010)
      WHEN mf.group_type='RISK'      THEN (random() < 0.007)
      ELSE (random() < 0.005)
    END AS is_missing,

    -- 변동성: WATCHLIST ±8%, RISK ±5%
    CASE
      WHEN mf.group_type='WATCHLIST' THEN (1.00 + ((random() * 0.16) - 0.08))
      ELSE (1.00 + ((random() * 0.10) - 0.05))
    END AS noise,

    CASE
      WHEN mf.group_type='WATCHLIST' THEN (1.00 + ((random() * 0.16) - 0.08))
      ELSE (1.00 + ((random() * 0.10) - 0.05))
    END AS order_noise,

    (1.00 + ((random() * 0.04) - 0.02)) AS cogs_noise,

    -- RISK 급락 3일 구간
    CASE
      WHEN mf.group_type='RISK' AND mf.business_date = sp.shock_date - INTERVAL '1 day' THEN 0.70
      WHEN mf.group_type='RISK' AND mf.business_date = sp.shock_date                     THEN 0.45
      WHEN mf.group_type='RISK' AND mf.business_date = sp.shock_date + INTERVAL '1 day' THEN 0.75
      ELSE 1.00
    END AS risk_shock_mult,

    -- (B) WATCHLIST 소규모 이슈 2일 구간(점포별 1회, 홀짝으로 날짜 분산)
    CASE
      WHEN mf.group_type='WATCHLIST'
       AND (
            (mf.store_id % 2 = 0 AND mf.business_date IN (DATE '2025-06-12', DATE '2025-06-13'))
         OR (mf.store_id % 2 = 1 AND mf.business_date IN (DATE '2025-07-08', DATE '2025-07-09'))
       )
      THEN 0.85
      ELSE 1.00
    END AS wl_event_mult

  FROM month_factor mf
  JOIN store_params sp ON sp.store_id = mf.store_id
),

final_daily AS (
  SELECT
    store_id,
    business_date,
    group_type,
    base_margin_rate,
    shock_date,
    is_missing,
    cogs_noise,
    (risk_shock_mult * wl_event_mult) AS event_mult,
    base_sales,
    base_orders,
    factor,
    weekend_boost,
    noise,
    order_noise
  FROM raw_daily
),

metrics AS (
  SELECT
    fd.store_id,
    fd.business_date,
    fd.group_type,
    fd.base_margin_rate,
    fd.shock_date,
    fd.is_missing,
    fd.cogs_noise,
    fd.event_mult,

    CASE
      WHEN fd.is_missing THEN 0::numeric
      ELSE GREATEST(
        0::numeric,
        ROUND((fd.base_sales * fd.factor * fd.weekend_boost * fd.noise * fd.event_mult)::numeric, 2)
      )
    END AS sales_amount,

    CASE
      WHEN fd.is_missing THEN 0
      ELSE GREATEST(
        1,
        ROUND((fd.base_orders * fd.factor * fd.order_noise * fd.event_mult)::numeric, 0)::int
      )
    END AS order_count
  FROM final_daily fd
)

INSERT INTO pos_daily
(
  store_id, business_date,
  sales_amount, order_count,
  cogs_amount, margin_amount,
  is_missing, missing_policy,
  is_abnormal, abnormal_type, abnormal_reason,
  created_at, updated_at
)
SELECT
  m.store_id,
  m.business_date,
  m.sales_amount,
  m.order_count,

  CASE
    WHEN m.is_missing THEN 0::numeric
    ELSE ROUND((m.sales_amount * (1 - m.base_margin_rate) * m.cogs_noise)::numeric, 2)
  END AS cogs_amount,

  CASE
    WHEN m.is_missing THEN 0::numeric
    ELSE ROUND((m.sales_amount - (m.sales_amount * (1 - m.base_margin_rate) * m.cogs_noise))::numeric, 2)
  END AS margin_amount,

  m.is_missing,
  CASE WHEN m.is_missing THEN 'ZERO_FILL' ELSE NULL END AS missing_policy,

  -- (A) RISK: D-1~D+1 3일 abnormal
  -- (B) WATCHLIST: 소규모 이슈 2일 abnormal
  CASE
    WHEN m.group_type='RISK'
     AND m.shock_date IS NOT NULL
     AND m.business_date BETWEEN (m.shock_date - INTERVAL '1 day') AND (m.shock_date + INTERVAL '1 day')
      THEN TRUE
    WHEN m.group_type='WATCHLIST'
     AND (
          (m.store_id % 2 = 0 AND m.business_date IN (DATE '2025-06-12', DATE '2025-06-13'))
       OR (m.store_id % 2 = 1 AND m.business_date IN (DATE '2025-07-08', DATE '2025-07-09'))
     )
      THEN TRUE
    ELSE FALSE
  END AS is_abnormal,

  CASE
    WHEN m.group_type='RISK'
     AND m.shock_date IS NOT NULL
     AND m.business_date BETWEEN (m.shock_date - INTERVAL '1 day') AND (m.shock_date + INTERVAL '1 day')
      THEN 'SALES_DROP'
    WHEN m.group_type='WATCHLIST'
     AND (
          (m.store_id % 2 = 0 AND m.business_date IN (DATE '2025-06-12', DATE '2025-06-13'))
       OR (m.store_id % 2 = 1 AND m.business_date IN (DATE '2025-07-08', DATE '2025-07-09'))
     )
      THEN 'OPERATION_ISSUE'
    ELSE NULL
  END AS abnormal_type,

  CASE
    WHEN m.group_type='RISK'
     AND m.shock_date IS NOT NULL
     AND m.business_date BETWEEN (m.shock_date - INTERVAL '1 day') AND (m.shock_date + INTERVAL '1 day')
      THEN 'sharp drop window (D-1~D+1)'
    WHEN m.group_type='WATCHLIST'
     AND (
          (m.store_id % 2 = 0 AND m.business_date IN (DATE '2025-06-12', DATE '2025-06-13'))
       OR (m.store_id % 2 = 1 AND m.business_date IN (DATE '2025-07-08', DATE '2025-07-09'))
     )
      THEN 'short instability window (watchlist)'
    ELSE NULL
  END AS abnormal_reason,

  NOW(), NOW()
FROM metrics m

ON CONFLICT (store_id, business_date) DO UPDATE SET
  sales_amount    = EXCLUDED.sales_amount,
  order_count     = EXCLUDED.order_count,
  cogs_amount     = EXCLUDED.cogs_amount,
  margin_amount   = EXCLUDED.margin_amount,
  is_missing      = EXCLUDED.is_missing,
  missing_policy  = EXCLUDED.missing_policy,
  is_abnormal     = EXCLUDED.is_abnormal,
  abnormal_type   = EXCLUDED.abnormal_type,
  abnormal_reason = EXCLUDED.abnormal_reason,
  updated_at      = NOW();

COMMIT;


 /*
============================================================
[최종 완성] POS_DAILY Group D/E (그룹 내 다양성 추가)
기간: 2025-03-01 ~ 2025-08-31
------------------------------------------------------------
1. RISK: 회복 목표 65% ~ 75% 로 점포별 차등 (회복 속도 느림)
2. WATCH: 회복 목표 80% ~ 90% 로 점포별 차등 (불안정성 높음)
3. NORMAL: 회복 목표 110% ~ 125% 로 점포별 차등 (V자 반등)
============================================================
*/

BEGIN;

SELECT setseed(0.777);

-- 1. 기존 데이터 삭제
DELETE FROM pos_daily
WHERE store_id IN (
    90, 100, 113,                         -- RISK
    88, 94, 96, 99, 103, 106, 118,        -- WATCHLIST
    1, 18, 35, 68, 108, 111               -- NORMAL
)
AND business_date BETWEEN DATE '2025-03-01' AND DATE '2025-08-31';

-- 2. 데이터 생성 로직
WITH
target_stores AS (
    SELECT * FROM (VALUES
        -- [RISK] target_recovery: 0.65 ~ 0.75 (회복해도 70% 언저리)
        (90,  'RISK', 2100000, 95,  DATE '2025-06-10', 0.65), -- 회복 제일 안됨
        (100, 'RISK', 2000000, 90,  DATE '2025-05-20', 0.68),
        (113, 'RISK', 2500000, 120, DATE '2025-04-15', 0.75), -- 그나마 조금 나음

        -- [WATCHLIST] target_recovery: 0.80 ~ 0.90 (85% 언저리 + 불안정)
        (88,  'WATCH', 2200000, 100, DATE '2025-04-05', 0.82),
        (94,  'WATCH', 1800000, 85,  DATE '2025-05-15', 0.85),
        (96,  'WATCH', 1950000, 92,  DATE '2025-03-25', 0.80), -- 회복 약함
        (99,  'WATCH', 2050000, 98,  DATE '2025-06-20', 0.88),
        (103, 'WATCH', 2300000, 110, DATE '2025-04-20', 0.90), -- 수치상으론 꽤 회복
        (106, 'WATCH', 1700000, 80,  DATE '2025-07-10', 0.83),
        (118, 'WATCH', 2150000, 105, DATE '2025-05-05', 0.86),

        -- [NORMAL] target_recovery: 1.10 ~ 1.25 (110% 이상 대박 성장)
        (1,   'NORMAL', 3500000, 180, DATE '2025-04-01', 1.25), -- 초대박 리뉴얼
        (18,  'NORMAL', 2800000, 140, DATE '2025-05-01', 1.15),
        (35,  'NORMAL', 2400000, 115, DATE '2025-03-20', 1.10),
        (68,  'NORMAL', 2600000, 125, DATE '2025-06-01', 1.12),
        (108, 'NORMAL', 2900000, 145, DATE '2025-04-10', 1.18),
        (111, 'NORMAL', 3200000, 160, DATE '2025-07-01', 1.20)
    ) AS t(store_id, group_type, base_sales, base_orders, shock_date, recovery_target)
),

dates AS (
    SELECT d::date AS business_date
    FROM generate_series(DATE '2025-03-01', DATE '2025-08-31', INTERVAL '1 day') AS gs(d)
),

daily_calculation AS (
    SELECT
        ts.store_id,
        ts.group_type,
        d.business_date,
        ts.base_sales,
        ts.base_orders,
        ts.shock_date,
        ts.recovery_target,

        CASE
            WHEN EXTRACT(ISODOW FROM d.business_date) IN (6, 7) THEN 1.25
            WHEN EXTRACT(ISODOW FROM d.business_date) = 5 THEN 1.10
            ELSE 0.9
        END AS dow_mult,

        -- [회복 목표치(recovery_target)를 적용한 멀티플라이어 로직]
        CASE
            -- 1. RISK: 0.45 바닥 -> 100일간 recovery_target(0.65~0.75)까지 천천히 이동
            WHEN ts.group_type = 'RISK' AND d.business_date BETWEEN ts.shock_date AND (ts.shock_date + 100) THEN
                 0.45 + ((d.business_date - ts.shock_date)::float / 100.0) * (ts.recovery_target - 0.45)
            WHEN ts.group_type = 'RISK' AND d.business_date > (ts.shock_date + 100) THEN
                 ts.recovery_target + (random() * 0.05) -- 목표치 도달 후 유지

            -- 2. WATCHLIST: 0.60 급락 -> 20일간 recovery_target(0.80~0.90)까지 회복 -> 이후 흔들림
            WHEN ts.group_type = 'WATCH' AND d.business_date = ts.shock_date THEN
                0.60
            WHEN ts.group_type = 'WATCH' AND d.business_date BETWEEN (ts.shock_date + 1) AND (ts.shock_date + 20) THEN
                0.60 + ((d.business_date - ts.shock_date)::float / 20.0) * (ts.recovery_target - 0.60)
            WHEN ts.group_type = 'WATCH' AND d.business_date > (ts.shock_date + 20) THEN
                ts.recovery_target + (random() * 0.25 - 0.125) -- 목표치 주변에서 심하게 흔들림 (불안정)

            -- 3. NORMAL: 0.60 급락 -> 30일간 recovery_target(1.10~1.25)까지 V자 성장
            WHEN ts.group_type = 'NORMAL' AND d.business_date BETWEEN ts.shock_date AND (ts.shock_date + 30) THEN
                0.60 + ((d.business_date - ts.shock_date)::float / 30.0) * (ts.recovery_target - 0.60)
            WHEN ts.group_type = 'NORMAL' AND d.business_date > (ts.shock_date + 30) THEN
                ts.recovery_target + (random() * 0.1)

            ELSE
                0.95 + (random() * 0.1) -- 평상시
        END AS event_mult,

        random() AS noise,
        random() AS missing_prob

    FROM target_stores ts
    CROSS JOIN dates d
),

final_data AS (
    SELECT
        store_id,
        business_date,
        group_type,
        shock_date,
        CASE WHEN missing_prob < 0.005 THEN TRUE ELSE FALSE END AS is_missing,
        ROUND((base_sales * dow_mult * event_mult * (0.95 + noise * 0.1))::numeric, -2) AS sales_amount,
        ROUND((base_orders * dow_mult * event_mult * (0.95 + noise * 0.1))::numeric, 0) AS order_count
    FROM daily_calculation
)

INSERT INTO pos_daily (
    store_id, business_date, sales_amount, order_count, cogs_amount, margin_amount,
    is_missing, missing_policy, is_abnormal, abnormal_type, abnormal_reason, created_at, updated_at
)
SELECT
    store_id,
    business_date,
    CASE WHEN is_missing THEN 0 ELSE sales_amount END,
    CASE WHEN is_missing THEN 0 ELSE order_count END,
    CASE WHEN is_missing THEN 0 ELSE ROUND((sales_amount * (0.65 + (random() * 0.05)))::numeric, -2) END,
    CASE WHEN is_missing THEN 0 ELSE sales_amount - ROUND((sales_amount * (0.65 + (random() * 0.05)))::numeric, -2) END,
    is_missing,
    CASE WHEN is_missing THEN 'ZERO_FILL' ELSE NULL END,

    -- [이상치: 모든 그룹이 '급락' 순간을 가짐]
    CASE
        WHEN business_date BETWEEN shock_date AND shock_date + 2 THEN TRUE
        WHEN is_missing THEN TRUE
        ELSE FALSE
    END AS is_abnormal,

    CASE
        WHEN is_missing THEN NULL
        WHEN business_date BETWEEN shock_date AND shock_date + 2 THEN 'SALES_DROP'
        ELSE NULL
    END AS abnormal_type,

    CASE
        WHEN group_type = 'RISK' AND business_date BETWEEN shock_date AND shock_date + 2 THEN '중대 이슈 발생 (회복 지연)'
        WHEN group_type = 'WATCH' AND business_date BETWEEN shock_date AND shock_date + 2 THEN '운영 이슈 발생 (불안정)'
        WHEN group_type = 'NORMAL' AND business_date = shock_date THEN '일시적 영업 영향 (시설/리뉴얼)'
        ELSE NULL
    END AS abnormal_reason,

    NOW(), NOW()
FROM final_data
ORDER BY store_id, business_date
ON CONFLICT (store_id, business_date) DO UPDATE SET
    sales_amount = EXCLUDED.sales_amount,
    order_count = EXCLUDED.order_count,
    cogs_amount = EXCLUDED.cogs_amount,
    margin_amount = EXCLUDED.margin_amount,
    is_missing = EXCLUDED.is_missing,
    missing_policy = EXCLUDED.missing_policy,
    is_abnormal = EXCLUDED.is_abnormal,
    abnormal_type = EXCLUDED.abnormal_type,
    abnormal_reason = EXCLUDED.abnormal_reason,
    updated_at = NOW();