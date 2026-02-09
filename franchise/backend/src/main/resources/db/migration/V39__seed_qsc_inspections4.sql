/* =========================================================
   [Flyway] 망원점(store_id=6) QSC 상태/점수 일괄 보정
   - qsc_inspections_items 기반으로 total_score 재계산
   - status = 'COMPLETED'로 통일
   - grade / is_passed / needs_reinspection / summary_comment까지 동기화
   ========================================================= */

WITH totals AS (
  SELECT
    m.inspection_id,
    m.inspected_at,
    ROUND((SUM(i.score)::numeric / (COUNT(*) * 5.0)) * 100)::int AS total_score_100
  FROM qsc_master m
  JOIN qsc_inspections_items i ON i.inspection_id = m.inspection_id
  WHERE m.store_id = 6
  GROUP BY m.inspection_id, m.inspected_at
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
  status = 'COMPLETED',
  confirmed_at = COALESCE(m.confirmed_at, m.inspected_at + interval '1 hour'),
  updated_at = COALESCE(m.updated_at, NOW()),
  summary_comment = CASE
    WHEN date_trunc('month', t.inspected_at)::date = date '2025-08-01'
      THEN '정기 점검 결과: 기준 미달로 재점검 필요'
    ELSE '정기 점검 완료'
  END
FROM totals t
WHERE m.inspection_id = t.inspection_id;
