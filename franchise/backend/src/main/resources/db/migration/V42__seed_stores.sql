/* =========================================================
   [Flyway] QSC 날짜 시연용 고정
   - 홍대1호점(store_id=4) → 2025-08-11
   - 신촌역점(store_id=5) → 2025-08-23
   ========================================================= */

-- 홍대1호점
UPDATE qsc_master
SET
    inspected_at = TIMESTAMPTZ '2025-08-11 14:00:00+09',
    confirmed_at = TIMESTAMPTZ '2025-08-11 15:00:00+09',
    created_at   = TIMESTAMPTZ '2025-08-11 09:00:00+09',
    updated_at   = TIMESTAMPTZ '2025-08-11 16:00:00+09'
WHERE store_id = 4;

-- 신촌역점
UPDATE qsc_master
SET
    inspected_at = TIMESTAMPTZ '2025-08-23 14:00:00+09',
    confirmed_at = TIMESTAMPTZ '2025-08-23 15:00:00+09',
    created_at   = TIMESTAMPTZ '2025-08-23 09:00:00+09',
    updated_at   = TIMESTAMPTZ '2025-08-23 16:00:00+09'
WHERE store_id = 5;
