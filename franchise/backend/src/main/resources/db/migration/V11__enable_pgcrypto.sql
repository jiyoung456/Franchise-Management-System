/* =========================================================
   V11__enable_pgcrypto_and_hash_user_passwords.sql

   목적:
   - V2 seed에서 users.password가 평문('1234')로 들어가도
     이후 마이그레이션 단계(V11)에서 bcrypt로 일괄 변환해서
     백엔드 BCrypt 로그인(matches)과 정합 맞추기

   주의:
   - V2 파일 수정 금지(이미 올라간 파일)
   - stores FK 때문에 users TRUNCATE/재삽입 금지
   ========================================================= */

-- 1) pgcrypto 확장 활성화 (crypt/gen_salt 사용)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) 이미 bcrypt 형태면 스킵하고,
--    평문/기타 값은 bcrypt로 변환
--    ($2a$ / $2b$ / $2y$ 는 bcrypt 포맷 prefix)
UPDATE users
SET password = crypt(password, gen_salt('bf'))
WHERE password IS NOT NULL
  AND password !~ '^\$2[aby]\$';

-- 3) (선택) seed가 '1234'로 들어가는 걸 확실히 잡고 싶으면 아래도 가능
-- UPDATE users
-- SET password = crypt('1234', gen_salt('bf'))
-- WHERE password = '1234';
