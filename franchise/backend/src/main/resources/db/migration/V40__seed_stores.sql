/* =========================================================
   [Flyway] 홍대1호점, 신촌역점 상태 WATCHLIST 변경
   ========================================================= */

UPDATE stores
SET
    current_state = 'WATCHLIST',
    updated_at = NOW()
WHERE store_id IN (4, 5);
