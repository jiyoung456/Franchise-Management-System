/* =========================================================
   [Flyway] 점포 current_state_score 시연용 보정
   - 홍대1호점: 65
   - 신촌역점: 70
   - 망원점: 82
   ========================================================= */

UPDATE stores
SET
    current_state_score = CASE
        WHEN store_id = 4 THEN 65
        WHEN store_id = 5 THEN 70
        WHEN store_id = 6 THEN 82
    END,
    updated_at = NOW()
WHERE store_id IN (4,5,6);
