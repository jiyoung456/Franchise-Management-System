/* template_id=3 / 안전(13004) 항목을 2개만 남기고 나머지 삭제 */

DELETE FROM qsc_template_items i
USING (
  SELECT template_item_id
  FROM (
    SELECT
      template_item_id,
      ROW_NUMBER() OVER (ORDER BY sort_order, template_item_id) AS rn
    FROM qsc_template_items
    WHERE template_id = 3
      AND template_category_id = 13004
  ) x
  WHERE x.rn > 2
) d
WHERE i.template_item_id = d.template_item_id;
