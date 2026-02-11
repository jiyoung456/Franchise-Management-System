/* =========================================================
   V38__qsc_demo_mangwon.sql
   망원점(store_id=6) QSC 시연 데이터 재생성 + COMPLETED 보정
   ========================================================= */

-- 0) 기존 데이터 삭제
DELETE FROM qsc_inspections_items ii
USING qsc_master m
WHERE ii.inspection_id = m.inspection_id
  AND m.store_id = 6;

DELETE FROM qsc_master
WHERE store_id = 6;


WITH plan AS (
  SELECT * FROM (VALUES
    (date '2025-06-06',  88),
    (date '2025-06-24',  92),
    (date '2025-07-07',  78),
    (date '2025-07-22',  83),
    (date '2025-08-05',  60),
    (date '2025-08-20',  55)
  ) v(inspection_day, target_total_score)
),

plan_with_tpl AS (
  SELECT
    6::bigint AS store_id,
    9::bigint AS inspector_id,
    p.inspection_day,
    p.target_total_score,
    (
      SELECT t.template_id
      FROM qsc_template t
      WHERE t.inspection_type = 'REGULAR'
        AND t.status = 'ACTIVE'
        AND t.effective_from <= p.inspection_day
        AND (t.effective_to IS NULL OR t.effective_to >= p.inspection_day)
      ORDER BY t.effective_from DESC
      LIMIT 1
    ) AS template_id
  FROM plan p
),

plan_ts AS (
  SELECT
    store_id,
    inspector_id,
    inspection_day,
    template_id,
    target_total_score,
    (inspection_day + time '14:00')::timestamptz AS inspected_at,
    (inspection_day + time '09:00')::timestamptz AS created_ts,
    (inspection_day + time '15:00')::timestamptz AS confirmed_ts,
    (inspection_day + time '16:30')::timestamptz AS updated_ts
  FROM plan_with_tpl
  WHERE template_id IS NOT NULL
),

ins_master AS (
  INSERT INTO qsc_master (
    store_id, template_id, inspector_id,
    inspected_at, status,
    total_score, grade, is_passed, needs_reinspection, summary_comment,
    created_at, confirmed_at, updated_at
  )
  SELECT
    store_id, template_id, inspector_id,
    inspected_at, 'CREATED',
    0, 'D', FALSE, TRUE, NULL,
    created_ts, confirmed_ts, updated_ts
  FROM plan_ts
  RETURNING inspection_id, template_id, inspected_at, created_at, updated_at
),

item_cnt AS (
  SELECT template_id, COUNT(*)::int AS n_items
  FROM qsc_template_items
  GROUP BY template_id
),

targets AS (
  SELECT
    m.inspection_id,
    m.template_id,
    p.target_total_score,
    ic.n_items,
    LEAST(ic.n_items*5,
          GREATEST(0, ROUND(p.target_total_score * ic.n_items * 5.0 / 100.0)::int)
    ) AS target_item_sum,
    m.created_at,
    m.updated_at
  FROM ins_master m
  JOIN plan_ts p
    ON p.template_id = m.template_id
   AND p.inspected_at = m.inspected_at
  JOIN item_cnt ic
    ON ic.template_id = m.template_id
),

items_ranked AS (
  SELECT
    t.inspection_id,
    ti.template_item_id,
    ROW_NUMBER() OVER (PARTITION BY t.inspection_id ORDER BY ti.template_item_id) AS rn_item,
    t.n_items,
    t.target_item_sum,
    t.created_at,
    t.updated_at
  FROM targets t
  JOIN qsc_template_items ti
    ON ti.template_id = t.template_id
),

items_scored AS (
  SELECT
    inspection_id,
    template_item_id,
    LEAST(
      5,
      (target_item_sum / n_items)
      + CASE WHEN rn_item <= (target_item_sum % n_items) THEN 1 ELSE 0 END
    )::int AS score,
    created_at,
    updated_at
  FROM items_ranked
),

ins_items AS (
  INSERT INTO qsc_inspections_items (inspection_id, template_item_id, score, created_at, updated_at)
  SELECT inspection_id, template_item_id, score, created_at, updated_at
  FROM items_scored
),

totals AS (
  SELECT
    m.inspection_id,
    ROUND((SUM(i.score)::numeric / (COUNT(*) * 5.0)) * 100)::int AS total_score_100
  FROM qsc_master m
  JOIN qsc_inspections_items i ON i.inspection_id = m.inspection_id
  WHERE m.store_id = 6
  GROUP BY m.inspection_id
)

UPDATE qsc_master m
SET
  total_score = t.total_score_100,
  grade = CASE
            WHEN t.total_score_100 >= 95 THEN 'S'
            WHEN t.total_score_100 >= 90 THEN 'A'
            WHEN t.total_score_100 >= 80 THEN 'B'
            WHEN t.total_score_100 >= 70 THEN 'C'
            ELSE 'D'
          END,
  is_passed = (t.total_score_100 >= 70),
  needs_reinspection = (t.total_score_100 < 70),
  summary_comment = CASE
    WHEN date_trunc('month', m.inspected_at)::date = date '2025-08-01'
      THEN '정기 점검 결과: 기준 미달로 재점검 필요'
    ELSE '정기 점검 완료'
  END,
  status = 'COMPLETED'
FROM totals t
WHERE m.inspection_id = t.inspection_id;
