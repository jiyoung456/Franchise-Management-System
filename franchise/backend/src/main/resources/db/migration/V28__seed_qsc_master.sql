-- QSC 더미 데이터 (inspection_id 10번부터 자동 생성됨)
-- 기간: 2025-03 ~ 2025-08
-- store_id: 1 ~ 100 순환

INSERT INTO qsc_master (
    store_id,
    template_id,
    inspector_id,
    inspected_at,
    status,
    total_score,
    grade,
    is_passed,
    needs_reinspection,
    summary_comment,
    confirmed_at,
    created_at,
    updated_at
)
SELECT
    ((g - 1) % 100) + 1                     AS store_id,
    1                                      AS template_id,
    ((g - 1) % 10) + 1                     AS inspector_id,
    inspected_at,
    'CONFIRMED'                            AS status,
    total_score,
    grade,
    (total_score >= 70)                    AS is_passed,
    (total_score < 70)                     AS needs_reinspection,
    '관리자 대시보드 확인용 더미 데이터'      AS summary_comment,
    inspected_at + INTERVAL '1 day'        AS confirmed_at,
    inspected_at                           AS created_at,
    inspected_at                           AS updated_at
FROM (
    SELECT
        g,
        d AS inspected_at,
        CASE
            WHEN g % 5 = 0 THEN 95
            WHEN g % 5 = 1 THEN 88
            WHEN g % 5 = 2 THEN 80
            WHEN g % 5 = 3 THEN 72
            ELSE 60
        END AS total_score,
        CASE
            WHEN g % 5 = 0 THEN 'S'
            WHEN g % 5 = 1 THEN 'A'
            WHEN g % 5 = 2 THEN 'B'
            WHEN g % 5 = 3 THEN 'C'
            ELSE 'D'
        END AS grade
    FROM generate_series(
             1,
             120
         ) g
    JOIN generate_series(
             '2025-03-01'::timestamp,
             '2025-08-01'::timestamp,
             interval '1 month'
         ) d ON true
) t;
