/* =========================================================
   event_log 테이블 생성 (PostgreSQL)
   - PK: event_id
   - FK: rule_id -> rules.rule_id (가정)
   - FK: store_id -> stores.store_id
   - FK: assigned_to_user_id -> users.user_id (nullable)
   ========================================================= */

CREATE TABLE IF NOT EXISTS event_log (
    event_id            BIGSERIAL PRIMARY KEY,

    rule_id             BIGINT NOT NULL,
    store_id            BIGINT NOT NULL,
    assigned_to_user_id BIGINT NULL,  -- 이벤트 담당자(user)

    event_type          VARCHAR(50) NOT NULL,  -- ex) POS_SALES_DROP
    occurred_at         TIMESTAMPTZ NOT NULL,   -- 이벤트 발생 시각

    severity            VARCHAR(20) NOT NULL,   -- INFO / WARNING / CRITICAL
    summary             TEXT NOT NULL,          -- 요약

    related_entity_type VARCHAR(30) NULL,       -- 관련 엔티티 타입(pos, qsc..)
    related_entity_id   BIGINT NULL,            -- 관련 엔티티 id

    status              VARCHAR(20) NOT NULL,   -- OPEN / ACK / CLOSED

    first_occurred_at   TIMESTAMPTZ NOT NULL,   -- 동일 이슈가 처음 발생한 시각
    last_occurrence_at  TIMESTAMPTZ NOT NULL,   -- 동일 이슈가 마지막으로 감지된 시각
    occurrence_count    INT NOT NULL DEFAULT 1, -- 동일 이슈 발생 횟수

    last_notified_at    TIMESTAMPTZ NULL,       -- 마지막 알림 발송 시각

    CONSTRAINT fk_event_rule
        FOREIGN KEY (rule_id) REFERENCES rules(rule_id),

    CONSTRAINT fk_event_store
        FOREIGN KEY (store_id) REFERENCES stores(store_id),

    CONSTRAINT fk_event_assignee
        FOREIGN KEY (assigned_to_user_id) REFERENCES users(user_id),

    CONSTRAINT chk_event_severity
        CHECK (severity IN ('INFO','WARNING','CRITICAL')),

    CONSTRAINT chk_event_status
        CHECK (status IN ('OPEN','ACK','CLOSED'))
);

-- (선택) “중복키: store_id + rule_id” 요구를 그대로 반영한 유니크
-- 운영상 '활성 이벤트(OPEN/ACK)만 유니크'로 하고 싶으면 부분 인덱스를 추천하지만,
-- 우선 요구대로 (store_id, rule_id) 유니크로 둠.
CREATE UNIQUE INDEX IF NOT EXISTS ux_event_store_rule
ON event_log (store_id, rule_id);

-- 조회 성능용 인덱스
CREATE INDEX IF NOT EXISTS ix_event_store_status_time
ON event_log (store_id, status, occurred_at DESC);

CREATE INDEX IF NOT EXISTS ix_event_severity_time
ON event_log (severity, occurred_at DESC);

CREATE INDEX IF NOT EXISTS ix_event_assignee_time
ON event_log (assigned_to_user_id, occurred_at DESC);

/* =========================================================

   event_log 더미데이터 20건

   - store_id: 너가 만든 stores의 ID(1~120) 범위 내에서 사용

   - assigned_to_user_id: users (1~30) 범위 내에서 사용

   - rule_id: rules 테이블에 해당 rule_id가 존재한다고 가정(1~10)

   ========================================================= */

-- 초기화(선택)

TRUNCATE TABLE event_log RESTART IDENTITY CASCADE;

INSERT INTO event_log (

  rule_id, store_id, assigned_to_user_id,

  event_type, occurred_at, severity, summary,

  related_entity_type, related_entity_id,

  status, first_occurred_at, last_occurrence_at, occurrence_count,

  last_notified_at

)

VALUES

-- 1

(1,  6,  9,  'POS_SALES_DROP',   '2026-01-20 09:15:00+09', 'CRITICAL',

'최근 7일 매출 성장률 급락(-12% 이하) 감지', 'pos', NULL,

'OPEN', '2026-01-20 09:15:00+09', '2026-01-20 09:15:00+09', 1, '2026-01-20 09:20:00+09'),

-- 2

(2,  6,  9,  'POS_ORDER_DROP',   '2026-01-20 09:17:00+09', 'WARNING',

'최근 7일 주문수 감소(-15% 수준) 감지', 'pos', NULL,

'ACK',  '2026-01-19 09:10:00+09', '2026-01-20 09:17:00+09', 2, '2026-01-20 09:25:00+09'),

-- 3

(3,  8, 10,  'QSC_SCORE_DROP',   '2026-01-19 14:05:00+09', 'WARNING',

'직전 QSC 대비 점수 하락(>= 10점) 감지', 'qsc', 10021,

'OPEN', '2026-01-19 14:05:00+09', '2026-01-19 14:05:00+09', 1, '2026-01-19 14:07:00+09'),

-- 4

(4, 12, 11,  'QSC_FAIL',         '2026-01-18 11:40:00+09', 'CRITICAL',

'QSC 불합격(C/D) 판정 발생', 'qsc', 10018,

'CLOSED','2026-01-18 11:40:00+09', '2026-01-18 11:40:00+09', 1, '2026-01-18 11:45:00+09'),

-- 5

(5,  3,  8,  'POS_MARGIN_DROP',  '2026-01-21 10:30:00+09', 'WARNING',

'마진율 하락(-15% 이하) 감지', 'pos', NULL,

'OPEN', '2026-01-21 10:30:00+09', '2026-01-21 10:30:00+09', 1, '2026-01-21 10:35:00+09'),

-- 6

(6, 29,  8,  'RISK_SCORE_SPIKE', '2026-01-21 08:05:00+09', 'CRITICAL',

'Risk Score 80점 이상(Critical) 구간 진입', 'risk', 501,

'OPEN', '2026-01-21 08:05:00+09', '2026-01-21 08:05:00+09', 1, '2026-01-21 08:06:00+09'),

-- 7

(7, 25, 20,  'VISIT_GAP_RISK',   '2026-01-17 09:00:00+09', 'WARNING',

'SV 방문 공백 60일 이상 감지', 'visit', NULL,

'ACK',  '2026-01-10 09:00:00+09', '2026-01-17 09:00:00+09', 3, '2026-01-17 09:05:00+09'),

-- 8

(8, 52, 21,  'ACTION_OVERDUE',   '2026-01-22 09:10:00+09', 'WARNING',

'조치(Action) 기한 초과 항목 존재', 'action', 30012,

'OPEN', '2026-01-22 09:10:00+09', '2026-01-22 09:10:00+09', 1, '2026-01-22 09:12:00+09'),

-- 9

(9, 49, 19,  'CONTRACT_EXPIRED', '2026-01-15 00:10:00+09', 'INFO',

'계약 만료로 운영상태 CLOSED 처리됨', 'store', 49,

'CLOSED','2026-01-15 00:10:00+09', '2026-01-15 00:10:00+09', 1, NULL),

-- 10

(10, 73, 20, 'OPEN_PLANNED',     '2026-01-20 16:00:00+09', 'INFO',

'오픈 예정 점포 - 사전 체크리스트 대상', 'store', 73,

'OPEN', '2026-01-20 16:00:00+09', '2026-01-20 16:00:00+09', 1, '2026-01-20 16:05:00+09'),

-- 11

(1,  65, 22, 'POS_SALES_DROP',   '2026-01-19 12:35:00+09', 'CRITICAL',

'최근 7일 매출 급락(-10% 이하) 감지', 'pos', NULL,

'OPEN', '2026-01-19 12:35:00+09', '2026-01-19 12:35:00+09', 1, '2026-01-19 12:40:00+09'),

-- 12

(2,  65, 22, 'POS_ORDER_DROP',   '2026-01-20 12:10:00+09', 'WARNING',

'최근 7일 주문수 급감(-15% 이하) 감지', 'pos', NULL,

'OPEN', '2026-01-19 12:10:00+09', '2026-01-20 12:10:00+09', 2, '2026-01-20 12:12:00+09'),

-- 13

(3,  90, 23, 'QSC_SCORE_DROP',   '2026-01-21 18:20:00+09', 'WARNING',

'QSC 총점 하락(>= 5점)으로 WATCH 신호', 'qsc', 10111,

'ACK',  '2026-01-20 18:20:00+09', '2026-01-21 18:20:00+09', 2, '2026-01-21 18:25:00+09'),

-- 14

(4,  84, 15, 'QSC_FAIL',         '2026-01-16 13:55:00+09', 'CRITICAL',

'QSC 불합격(C/D) 발생 - 즉시 재점검 권고', 'qsc', 10077,

'OPEN', '2026-01-16 13:55:00+09', '2026-01-16 13:55:00+09', 1, '2026-01-16 14:00:00+09'),

-- 15

(5,  88, 21, 'POS_MARGIN_DROP',  '2026-01-18 20:10:00+09', 'WARNING',

'원가 상승 또는 할인 증가로 마진 악화 감지', 'pos', NULL,

'ACK',  '2026-01-17 20:10:00+09', '2026-01-18 20:10:00+09', 2, '2026-01-18 20:12:00+09'),

-- 16

(6,  74, 17, 'RISK_SCORE_SPIKE', '2026-01-22 08:00:00+09', 'CRITICAL',

'Risk Score 75점 이상(RISK) 구간 진입', 'risk', 602,

'OPEN', '2026-01-22 08:00:00+09', '2026-01-22 08:00:00+09', 1, '2026-01-22 08:01:00+09'),

-- 17

(7,  31, 16, 'VISIT_GAP_WATCH',  '2026-01-20 10:00:00+09', 'INFO',

'SV 방문 공백 30일 이상(WATCH) 감지', 'visit', NULL,

'OPEN', '2026-01-20 10:00:00+09', '2026-01-20 10:00:00+09', 1, '2026-01-20 10:05:00+09'),

-- 18

(8,  56, 21, 'ACTION_OVERDUE',   '2026-01-19 09:40:00+09', 'WARNING',

'조치 미이행/기한초과 누적', 'action', 30055,

'ACK',  '2026-01-18 09:40:00+09', '2026-01-19 09:40:00+09', 2, '2026-01-19 09:42:00+09'),

-- 19

(9,  2,  8,  'STORE_CLOSED',     '2026-01-14 00:05:00+09', 'INFO',

'운영상태 CLOSED(폐점/휴점) 처리됨', 'store', 2,

'CLOSED','2026-01-14 00:05:00+09', '2026-01-14 00:05:00+09', 1, NULL),

-- 20

(10, 80, 21, 'OPEN_PLANNED',     '2026-01-22 15:00:00+09', 'INFO',

'오픈 예정 점포 - 오픈 전 QSC/위생 체크 준비 필요', 'store', 80,

'OPEN', '2026-01-22 15:00:00+09', '2026-01-22 15:00:00+09', 1, '2026-01-22 15:02:00+09');



 INSERT INTO actions (
   store_id, related_event_id,
   action_type, title, description,
   priority, status,
   target_metric_code,
   due_date,
   assigned_to_user_id, created_by_user_id,
   created_at, updated_at
 )
 VALUES
 -- event_log #1 POS_SALES_DROP (CRITICAL / OPEN)
 (6, 1, 'VISIT', '매출 급락 원인 점검 방문',
  '최근 7일 매출 성장률 급락 감지: 현장 점검 후 원인(인력/품절/상권/채널) 분석 및 개선안 수립',
  'CRITICAL', 'OPEN', 'POS_SALES', '2026-01-23', 9, 1,
  '2026-01-20 09:16:00', '2026-01-20 09:16:00'),

 -- #2 POS_ORDER_DROP (WARNING / ACK -> IN_PROGRESS)
 (6, 2, 'VISIT', '주문수 감소 대응 점검',
  '최근 7일 주문수 감소 감지: 피크타임 운영/대기시간/품절/채널별 주문 확인 및 개선',
  'HIGH', 'IN_PROGRESS', 'POS_ORDER_COUNT', '2026-01-24', 9, 1,
  '2026-01-20 09:18:00', '2026-01-20 09:18:00'),

 -- #3 QSC_SCORE_DROP (WARNING / OPEN)
 (8, 3, 'REINSPECTION', 'QSC 점수 하락 재점검',
  '직전 QSC 대비 점수 하락 감지: 하락 항목 개선 후 재점검 및 교육 병행',
  'HIGH', 'OPEN', 'QSC_TOTAL', '2026-01-22', 10, 1,
  '2026-01-19 14:06:00', '2026-01-19 14:06:00'),

 -- #5 POS_MARGIN_DROP (WARNING / OPEN)
 (3, 5, 'VISIT', '마진율 하락 원인 점검',
  '마진율 하락 감지: 원가/할인/폐기/레시피 준수/프로모션 영향 점검 및 조정',
  'HIGH', 'OPEN', 'POS_MARGIN', '2026-01-24', 8, 1,
  '2026-01-21 10:31:00', '2026-01-21 10:31:00'),

 -- #6 RISK_SCORE_SPIKE (CRITICAL / OPEN)
 (29, 6, 'VISIT', 'Risk Score 급등 즉시 점검',
  'Risk Score Critical 구간 진입: 리스크 원인 항목 확인 및 단기 대응 플랜 수립',
  'CRITICAL', 'OPEN', 'RISK_SCORE', '2026-01-22', 8, 1,
  '2026-01-21 08:06:00', '2026-01-21 08:06:00'),

 -- #7 VISIT_GAP_RISK (WARNING / ACK -> IN_PROGRESS)
 (25, 7, 'VISIT', 'SV 방문 공백 리스크 해소',
  'SV 방문 공백 60일 이상: 방문 일정 확정 및 체크리스트 기반 점검 수행',
  'HIGH', 'IN_PROGRESS', 'VISIT_GAP_DAYS', '2026-01-25', 20, 1,
  '2026-01-17 09:01:00', '2026-01-17 09:01:00'),

 -- #8 ACTION_OVERDUE (WARNING / OPEN)
 (52, 8, 'REINSPECTION', '기한초과 조치 정리 및 재기한 설정',
  '조치(Action) 기한 초과 항목 존재: 미이행 사유 파악 후 재할당/재기한 설정 및 추적',
  'HIGH', 'OPEN', 'ACTION_OVERDUE', '2026-01-24', 21, 1,
  '2026-01-22 09:11:00', '2026-01-22 09:11:00'),

 -- #11 POS_SALES_DROP (CRITICAL / OPEN)
 (65, 11, 'VISIT', '매출 급락 원인 점검(65점포)',
  '최근 7일 매출 급락 감지: 메뉴 믹스/인력/피크 운영/배달채널 노출 점검',
  'CRITICAL', 'OPEN', 'POS_SALES', '2026-01-22', 22, 1,
  '2026-01-19 12:36:00', '2026-01-19 12:36:00'),

 -- #12 POS_ORDER_DROP (WARNING / OPEN)
 (65, 12, 'VISIT', '주문수 급감 대응 점검(65점포)',
  '최근 7일 주문수 급감 감지: 대기시간/품절/리뷰/채널별 유입 확인 및 개선',
  'HIGH', 'OPEN', 'POS_ORDER_COUNT', '2026-01-23', 22, 1,
  '2026-01-20 12:11:00', '2026-01-20 12:11:00'),

 -- #16 RISK_SCORE_SPIKE (CRITICAL / OPEN)
 (74, 16, 'VISIT', 'Risk Score 상승 점검(74점포)',
  'Risk Score 75점 이상 구간 진입: 리스크 원인 항목 점검 및 재발 방지 조치 수립',
  'CRITICAL', 'OPEN', 'RISK_SCORE', '2026-01-23', 17, 1,
  '2026-01-22 08:01:00', '2026-01-22 08:01:00');

INSERT INTO action_results (
  action_id, created_by_user_id,
  performed_at, result_comment, created_at
)
VALUES
(1, 9,  '2026-01-22 10:00:00', '매출 급락 원인: 피크 인력 부족/품절 발생. 인력 재배치 및 발주 기준 조정', '2026-01-22 10:10:00'),
(2, 9,  '2026-01-22 10:20:00', '주문수 감소: 배달 채널 노출 저하 확인. 배달 프로모션 재세팅', '2026-01-22 10:30:00'),
(3, 10, '2026-01-21 15:00:00', 'QSC 하락 항목(위생/서비스) 개선 가이드 전달 및 재교육 완료', '2026-01-21 15:10:00'),
(4, 8,  '2026-01-22 13:00:00', '마진 하락: 할인 과다/폐기 증가. 할인 정책 조정 및 폐기 기준 강화', '2026-01-22 13:10:00'),
(5, 8,  '2026-01-22 09:30:00', 'Risk 상승: 클레임/위생 항목 동시 악화. 즉시 개선 체크리스트 적용', '2026-01-22 09:40:00'),
(6, 20, '2026-01-23 11:00:00', '방문 공백 해소: 운영 점검 및 후속 방문 일정 확정', '2026-01-23 11:10:00'),
(7, 21, '2026-01-23 14:00:00', '기한초과 조치 정리: 우선순위 재설정 후 담당 재지정', '2026-01-23 14:05:00'),
(8, 22, '2026-01-21 12:00:00', '매출 급락: 배달 리뷰 악화 영향. 응대/품질 개선 및 리뷰 관리 시작', '2026-01-21 12:10:00'),
(9, 22, '2026-01-21 12:30:00', '주문수 급감: 메뉴 품절 빈도 높음. 핵심 SKU 발주량 상향', '2026-01-21 12:40:00'),
(10, 17,'2026-01-22 16:00:00', 'Risk 상승 원인 점검 완료: 교육/위생/운영 항목 개선 플랜 수립', '2026-01-22 16:10:00');
