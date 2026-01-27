/* =========================================================
   V10__alter_users_for_auth.sql
   - users.region 컬럼 추가
   - ADMIN department = '운영본부' 고정
   - region 값은 UI 드롭다운 기준 6개로 세팅
     ('서울/경기','부산/경남','강원/충청','전라/광주','대구/울산/경북','제주')
   - ADMIN은 region='ALL' (프론트에서 전체로 처리 권장)
   - 주의: TRUNCATE/재삽입 금지 (stores FK 깨질 수 있음)
   ========================================================= */

-- 1) region 컬럼 추가 (이미 있으면 스킵)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS region VARCHAR(50);

COMMENT ON COLUMN users.region IS '담당 지역(권한/필터링용)';

-- 2) ADMIN 부서 고정: 운영본부
UPDATE users
SET department = '운영본부'
WHERE role = 'ADMIN'
  AND (department IS DISTINCT FROM '운영본부');

-- 3) region 채우기 (NULL만)
--    - ADMIN: ALL (전점포 조회 용도)
--    - 그 외: department 기준 기본 매핑 (필요하면 여기만 바꾸면 됨)
UPDATE users
SET region = CASE
    WHEN role = 'ADMIN' THEN 'ALL'

    WHEN role IN ('MANAGER', 'SUPERVISOR') THEN
        CASE
            -- 운영팀 매핑 (프로젝트 기준 기본값)
            WHEN department IN ('운영1팀', '운영2팀') THEN '서울/경기'
            WHEN department = '운영3팀' THEN '강원/충청'

            -- 전사 조직(가맹/품질)은 전국 단위일 가능성이 높아서 기본은 서울/경기로 두고,
            -- 필요하면 아래 "4) 예외 규칙"에서 팀/개인별로 덮어쓰기 추천
            WHEN department IN ('가맹관리팀', '품질관리팀') THEN '서울/경기'

            -- 혹시 운영본부가 섞여 있으면 전체로(보수적)
            WHEN department = '운영본부' THEN '서울/경기'

            ELSE '서울/경기'
        END

    ELSE '서울/경기'
END
WHERE region IS NULL;

-- 4) (권장) SV들의 region을 "실제로 담당하는 점포" 기준으로 자동 산출해서 덮어쓰기
--    - stores.region_code prefix를 6개 권역으로 매핑
--    - supervisor가 점포를 하나도 맡지 않으면 기존 값 유지
WITH sv_store_region AS (
    SELECT
        u.user_id,
        CASE
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'SEOUL_%' OR s.region_code LIKE 'GYEONGGI_%') > 0 THEN '서울/경기'
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'BUSAN_%' OR s.region_code LIKE 'GYEONGNAM_%') > 0 THEN '부산/경남'
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'GANGWON_%'
                                  OR s.region_code LIKE 'CHUNGNAM_%'
                                  OR s.region_code LIKE 'CHUNGBUK_%'
                                  OR s.region_code LIKE 'DAEJEON_%'
                                  OR s.region_code LIKE 'SEJONG_%') > 0 THEN '강원/충청'
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'GWANGJU_%'
                                  OR s.region_code LIKE 'JEONBUK_%'
                                  OR s.region_code LIKE 'JEONNAM_%') > 0 THEN '전라/광주'
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'DAEGU_%'
                                  OR s.region_code LIKE 'ULSAN_%'
                                  OR s.region_code LIKE 'GYEONGBUK_%') > 0 THEN '대구/울산/경북'
            WHEN COUNT(*) FILTER (WHERE s.region_code LIKE 'JEJU_%') > 0 THEN '제주'
            ELSE NULL
        END AS computed_region
    FROM users u
    LEFT JOIN stores s ON s.current_supervisor_id = u.user_id
    WHERE u.role = 'SUPERVISOR'
    GROUP BY u.user_id
)
UPDATE users u
SET region = r.computed_region
FROM sv_store_region r
WHERE u.user_id = r.user_id
  AND r.computed_region IS NOT NULL;

-- 5) (선택) MANAGER도 담당 점포(또는 팀 범위)가 정해져 있으면 같은 방식으로 산출 가능
-- 지금 스키마상 manager->store 직접 매핑이 없어서 자동 산출은 보류.
-- 필요하면 manager는 department 기준으로만 유지하거나, login_id 기준으로 개별 덮어쓰기 하자.

-- 6) 값 검증용 (필요하면 실행 후 확인)
-- SELECT role, department, region, COUNT(*) FROM users GROUP BY role, department, region ORDER BY role, department;

-- 7) (선택) region 값 체크 제약(나중에 안정화되면 추천)
--    ADMIN의 'ALL'을 허용할지 여부에 따라 IN 목록을 조절하면 됨.
-- ALTER TABLE users
-- ADD CONSTRAINT ck_users_region
-- CHECK (region IN ('서울/경기','부산/경남','강원/충청','전라/광주','대구/울산/경북','제주','ALL'));
