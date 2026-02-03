-- 1) 기존 데이터 정리 (안전하게 기간+store 범위만 삭제)
DELETE FROM pos_period_agg
WHERE store_id BETWEEN 1 AND 100
  AND period_type IN ('MONTH','WEEK')
  AND (
    -- MONTH: 2025-03~2025-08
    (period_type = 'MONTH'
      AND period_start >= DATE '2025-03-01'
      AND period_start <= DATE '2025-08-01'
    )
    OR
    -- WEEK: 주 단위는 period_start가 3/1 이전(2/24 같은 월요일)일 수도 있으니 end로도 커버
    (period_type = 'WEEK'
      AND period_end >= DATE '2025-03-01'
      AND period_start <= DATE '2025-08-31'
    )
  );

-- 2) MONTH 더미 생성: 2025-03-01 ~ 2025-08-01 (각 월 1일 기준)
WITH months AS (
  SELECT generate_series(DATE '2025-03-01', DATE '2025-08-01', INTERVAL '1 month')::date AS period_start
),
stores AS (
  SELECT generate_series(1, 100) AS store_id
)
INSERT INTO pos_period_agg (
  store_id, period_type, period_start, period_end,
  sales_amount, order_count, aov,
  cogs_amount, margin_amount, margin_rate,
  sales_change_rate, order_change_rate, aov_change_rate,
  created_at
)
SELECT
  s.store_id,
  'MONTH'::varchar AS period_type,
  m.period_start,
  (m.period_start + INTERVAL '1 month - 1 day')::date AS period_end,

  -- 매출: 점포/월마다 조금씩 다르게 (규칙 기반)
  ROUND( (50000000
        + (s.store_id * 120000)
        + (EXTRACT(MONTH FROM m.period_start)::int * 1800000)
        + (s.store_id % 7) * 350000
       )::numeric, 2) AS sales_amount,

  -- 주문수: 매출에 비례 + 점포별 편차
  (3200
   + (s.store_id * 8)
   + (EXTRACT(MONTH FROM m.period_start)::int * 120)
   + (s.store_id % 9) * 15
  )::int AS order_count,

  -- AOV = sales / orders
  ROUND(
    ( (50000000
        + (s.store_id * 120000)
        + (EXTRACT(MONTH FROM m.period_start)::int * 1800000)
        + (s.store_id % 7) * 350000
      )
      /
      NULLIF(
        (3200
         + (s.store_id * 8)
         + (EXTRACT(MONTH FROM m.period_start)::int * 120)
         + (s.store_id % 9) * 15
        ), 0
      )
    )::numeric
  , 2) AS aov,

  -- 마진율: 0.31~0.36 범위로 점포마다 조금씩
  ROUND(
    (0.31
     + (s.store_id % 6) * 0.006
     + (EXTRACT(MONTH FROM m.period_start)::int % 3) * 0.004
    )::numeric
  , 4) AS margin_rate,

  -- 원가/마진: margin_rate를 기반으로 계산
  ROUND(
    ( (50000000
        + (s.store_id * 120000)
        + (EXTRACT(MONTH FROM m.period_start)::int * 1800000)
        + (s.store_id % 7) * 350000
      )
      * (1 - (0.31
              + (s.store_id % 6) * 0.006
              + (EXTRACT(MONTH FROM m.period_start)::int % 3) * 0.004
             ))
    )::numeric
  , 2) AS cogs_amount,

  ROUND(
    ( (50000000
        + (s.store_id * 120000)
        + (EXTRACT(MONTH FROM m.period_start)::int * 1800000)
        + (s.store_id % 7) * 350000
      )
      * (0.31
         + (s.store_id % 6) * 0.006
         + (EXTRACT(MONTH FROM m.period_start)::int % 3) * 0.004
        )
    )::numeric
  , 2) AS margin_amount,

  -- change rate 컬럼은 서비스에서 계산하니 null로 둬도 됨
  NULL::numeric AS sales_change_rate,
  NULL::numeric AS order_change_rate,
  NULL::numeric AS aov_change_rate,

  now() AS created_at
FROM stores s
CROSS JOIN months m;

-- 3) WEEK 더미 생성:
-- 주간은 "월요일 period_start" 기준으로 2025-03-01~2025-08-31을 커버하도록 생성
WITH weeks AS (
  SELECT generate_series(
           DATE '2025-03-01',
           DATE '2025-08-31',
           INTERVAL '1 week'
         )::date AS raw_date
),
week_starts AS (
  -- raw_date가 속한 주의 월요일
  SELECT DISTINCT (raw_date - ((EXTRACT(ISODOW FROM raw_date)::int - 1) * INTERVAL '1 day'))::date AS period_start
  FROM weeks
),
stores AS (
  SELECT generate_series(1, 100) AS store_id
)
INSERT INTO pos_period_agg (
  store_id, period_type, period_start, period_end,
  sales_amount, order_count, aov,
  cogs_amount, margin_amount, margin_rate,
  sales_change_rate, order_change_rate, aov_change_rate,
  created_at
)
SELECT
  s.store_id,
  'WEEK'::varchar AS period_type,
  w.period_start,
  (w.period_start + INTERVAL '6 days')::date AS period_end,

  -- 주매출: 월매출의 1/4 정도 느낌 + 점포/주별 편차
  ROUND( (12000000
        + (s.store_id * 28000)
        + (EXTRACT(MONTH FROM w.period_start)::int * 180000)
        + (EXTRACT(WEEK FROM w.period_start)::int % 5) * 220000
        + (s.store_id % 7) * 90000
       )::numeric, 2) AS sales_amount,

  (780
   + (s.store_id * 2)
   + (EXTRACT(WEEK FROM w.period_start)::int % 4) * 25
   + (s.store_id % 9) * 6
  )::int AS order_count,

  ROUND(
    ( (12000000
        + (s.store_id * 28000)
        + (EXTRACT(MONTH FROM w.period_start)::int * 180000)
        + (EXTRACT(WEEK FROM w.period_start)::int % 5) * 220000
        + (s.store_id % 7) * 90000
      )
      /
      NULLIF(
        (780
         + (s.store_id * 2)
         + (EXTRACT(WEEK FROM w.period_start)::int % 4) * 25
         + (s.store_id % 9) * 6
        ), 0
      )
    )::numeric
  , 2) AS aov,

  ROUND(
    (0.31
     + (s.store_id % 6) * 0.006
     + (EXTRACT(WEEK FROM w.period_start)::int % 3) * 0.004
    )::numeric
  , 4) AS margin_rate,

  ROUND(
    ( (12000000
        + (s.store_id * 28000)
        + (EXTRACT(MONTH FROM w.period_start)::int * 180000)
        + (EXTRACT(WEEK FROM w.period_start)::int % 5) * 220000
        + (s.store_id % 7) * 90000
      )
      * (1 - (0.31
              + (s.store_id % 6) * 0.006
              + (EXTRACT(WEEK FROM w.period_start)::int % 3) * 0.004
             ))
    )::numeric
  , 2) AS cogs_amount,

  ROUND(
    ( (12000000
        + (s.store_id * 28000)
        + (EXTRACT(MONTH FROM w.period_start)::int * 180000)
        + (EXTRACT(WEEK FROM w.period_start)::int % 5) * 220000
        + (s.store_id % 7) * 90000
      )
      * (0.31
         + (s.store_id % 6) * 0.006
         + (EXTRACT(WEEK FROM w.period_start)::int % 3) * 0.004
        )
    )::numeric
  , 2) AS margin_amount,

  NULL::numeric AS sales_change_rate,
  NULL::numeric AS order_change_rate,
  NULL::numeric AS aov_change_rate,

  now() AS created_at
FROM stores s
CROSS JOIN week_starts w
WHERE w.period_start >= DATE '2025-03-01'
  AND w.period_start <= DATE '2025-08-31';
