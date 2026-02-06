-- inspection_id=1에 템플릿 항목 점수 더미 생성 (중복 방지)
INSERT INTO qsc_inspections_items (inspection_id, template_item_id, score, created_at, updated_at)
SELECT
    1 AS inspection_id,
    ti.template_item_id,
    -- 점수 더미: 1~5 (원하는 패턴으로 바꿔도 됨)
    (floor(random() * 5) + 1)::int AS score,
    now(),
    now()
FROM qsc_template_items ti
WHERE ti.template_id = (SELECT template_id FROM qsc_master WHERE inspection_id = 1)
AND NOT EXISTS (
    SELECT 1
    FROM qsc_inspections_items ii
    WHERE ii.inspection_id = 1
      AND ii.template_item_id = ti.template_item_id
);
