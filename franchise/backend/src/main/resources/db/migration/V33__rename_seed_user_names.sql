/* =========================================================
   V33__rename_seed_user_names.sql
   - Seed data correction: rename 2 users only
   - Change:
     1) ADMIN '김본사'  -> '김하늘' (login_id = 'admin01')
     2) MANAGER '박팀장' -> '박재희' (login_id = 'leader01')
   - Everything else remains the same
   ========================================================= */

UPDATE users
SET user_name = '김하늘'
WHERE login_id = 'admin01' AND role = 'ADMIN';

UPDATE users
SET user_name = '박재희'
WHERE login_id = 'leader01' AND role = 'MANAGER';
