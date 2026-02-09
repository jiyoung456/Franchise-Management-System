/* =========================================================
   QSC template_id=3 문항 구조 변경
   - 13001(위생/CLEANLINESS): 6개
   - 13002(서비스/SERVICE)   : 6개
   - 13003(품질/QUALITY)     : 6개
   - 13004(안전/SAFETY)      : 2개
   전제:
   - qsc_inspections_items에서 template_id=3, 13004, sort_order=3 참조 0건 확인됨
   ========================================================= */

-- ---------------------------------------------------------
-- 0) 안전(130004): 3번째 문항 삭제 (참조 없을 때만)
--    - 여러 번 실행해도 안전 (없으면 0 rows)
-- ---------------------------------------------------------
DELETE FROM qsc_template_items
WHERE template_id = 3
  AND template_category_id = 130004
  AND sort_order = 3;

-- ---------------------------------------------------------
-- 1) 위생(13001): sort_order 4~6 추가 (없을 때만)
-- ---------------------------------------------------------
INSERT INTO qsc_template_items (template_id, template_category_id, item_name, is_required, sort_order)
SELECT 3, 13001, v.item_name, v.is_required, v.sort_order
FROM (
  VALUES
    (4, '냉장/냉동고 내부 청결 및 정리정돈 상태 적정', TRUE),
    (5, '손세정/소독제 비치 및 사용(직원 위생수칙) 준수', TRUE),
    (6, '교차오염 방지(칼/도마 분리, 보관 용기 라벨링) 준수', TRUE)
) AS v(sort_order, item_name, is_required)
WHERE NOT EXISTS (
  SELECT 1
  FROM qsc_template_items i
  WHERE i.template_id = 3
    AND i.template_category_id = 13001
    AND i.sort_order = v.sort_order
);

-- ---------------------------------------------------------
-- 2) 서비스(13002): sort_order 4~6 추가 (없을 때만)
-- ---------------------------------------------------------
INSERT INTO qsc_template_items (template_id, template_category_id, item_name, is_required, sort_order)
SELECT 3, 13002, v.item_name, v.is_required, v.sort_order
FROM (
  VALUES
    (4, '고객 문의/요청 사항 정확히 확인 후 안내', TRUE),
    (5, '피크타임 대기 안내 및 예상 시간 고지 준수', TRUE),
    (6, '불만/클레임 발생 시 기록 및 후속 조치 공유', TRUE)
) AS v(sort_order, item_name, is_required)
WHERE NOT EXISTS (
  SELECT 1
  FROM qsc_template_items i
  WHERE i.template_id = 3
    AND i.template_category_id = 13002
    AND i.sort_order = v.sort_order
);

-- ---------------------------------------------------------
-- 3) 품질(13003): sort_order 4~6 추가 (없을 때만)
-- ---------------------------------------------------------
INSERT INTO qsc_template_items (template_id, template_category_id, item_name, is_required, sort_order)
SELECT 3, 13003, v.item_name, v.is_required, v.sort_order
FROM (
  VALUES
    (4, '제공 제품 외관/구성(누락/파손) 이상 없음', TRUE),
    (5, '표준 레시피/정량 준수(편차 허용범위 내) 확인', TRUE),
    (6, '핵심 메뉴 품질 기준(맛/온도/식감) 샘플링 점검', TRUE)
) AS v(sort_order, item_name, is_required)
WHERE NOT EXISTS (
  SELECT 1
  FROM qsc_template_items i
  WHERE i.template_id = 3
    AND i.template_category_id = 13003
    AND i.sort_order = v.sort_order
);

-- ---------------------------------------------------------
-- 4) 안전(130004): 남은 항목 sort_order 정합성 확인
--    - 혹시 기존 데이터가 꼬여서 1,2가 아닌 경우 대비해서
--      1,2만 남기고 나머지 삭제(현재는 1~3 구조였으니 영향 없을 가능성 높음)
-- ---------------------------------------------------------
DELETE FROM qsc_template_items i
USING (
  SELECT template_item_id
  FROM (
    SELECT
      template_item_id,
      ROW_NUMBER() OVER (ORDER BY sort_order, template_item_id) AS rn
    FROM qsc_template_items
    WHERE template_id = 3
      AND template_category_id = 130004
  ) x
  WHERE x.rn > 2
) d
WHERE i.template_item_id = d.template_item_id;
