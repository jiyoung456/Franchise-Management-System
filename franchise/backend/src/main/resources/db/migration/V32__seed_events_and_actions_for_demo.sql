TRUNCATE TABLE action_attachments RESTART IDENTITY CASCADE;
TRUNCATE TABLE action_results RESTART IDENTITY CASCADE;
TRUNCATE TABLE actions RESTART IDENTITY CASCADE;
TRUNCATE TABLE event_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE event_rule_condition RESTART IDENTITY CASCADE;
TRUNCATE TABLE event_rule RESTART IDENTITY CASCADE;


/* =========================================================
   2) event_rule (10)
   ========================================================= */
INSERT INTO event_rule (
  rule_id, rule_name, event_type, description,
  severity_default, is_active, dedup_scope,
  cooldown_days, persist_days_threshold, ack_sla_days, action_sla_days,
  created_at, updated_at
)
VALUES
(1,  'POS 매출 급락',         'POS', '최근 7일 매출 성장률 급락 감지', 'CRITICAL', TRUE, 'STORE_RULE', 1, 0, 3, 7, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(2,  'POS 주문수 급감',       'POS', '최근 7일 주문수 감소 감지',      'WARNING',  TRUE, 'STORE_RULE', 1, 0, 3, 7, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(3,  'QSC 점수 하락',         'QSC', '직전 대비 QSC 점수 하락 감지',    'WARNING',  TRUE, 'STORE_RULE', 1, 0, 3, 7, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(4,  'QSC 불합격',            'QSC', 'QSC 불합격 감지',                 'CRITICAL', TRUE, 'STORE_RULE', 1, 0, 2, 5, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(5,  'POS 마진율 하락',       'POS', '마진율 급락 감지',                'WARNING',  TRUE, 'STORE_RULE', 2, 0, 3, 7, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(6,  '위험점수 급등',         'OPS', 'Risk Score 고위험 구간 진입',      'CRITICAL', TRUE, 'STORE_RULE', 1, 0, 2, 5, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(7,  'SV 방문 공백',          'OPS', '방문 공백 임계치 초과',            'WARNING',  TRUE, 'STORE_RULE', 3, 0, 5, 10,'2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(8,  '조치 기한초과',         'OPS', 'Action overdue 감지',             'WARNING',  TRUE, 'STORE_RULE', 1, 0, 3, 7, '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(9,  '계약/운영 상태 변경',   'SM',  '계약만료/운영상태 변경 감지',      'INFO',     TRUE, 'STORE_RULE', 7, 0, 7, 14,'2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(10, '오픈 예정 점포 알림',   'SM',  '오픈 예정 점포 사전 준비',         'INFO',     TRUE, 'STORE_RULE', 7, 0, 7, 14,'2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09');


/* =========================================================
   3) event_rule_condition (rule별 1개)
   ========================================================= */
INSERT INTO event_rule_condition (
  rule_id, metric_key, window_size, window_unit, agg_func, compare_to,
  operator, threshold_value, threshold_unit,
  created_at, updated_at
)
VALUES
(1,  'SALES_GROWTH_7D', 7, 'DAY', 'LAST', 'PREVIOUS_PERIOD', '<=', -0.10, '%',     '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(2,  'ORDER_GROWTH_7D', 7, 'DAY', 'LAST', 'PREVIOUS_PERIOD', '<=', -0.15, '%',     '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(3,  'QSC_DIFF_PREV',   1, 'DAY', 'LAST', 'PREVIOUS_INSPECTION', '<=', -10.0,'POINT','2025-08-01 09:00:00+09','2025-08-01 09:00:00+09'),
(4,  'QSC_TOTAL_SCORE', 1, 'DAY', 'LAST', 'NONE', '<', 80.0, 'POINT',              '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(5,  'MARGIN_RATE_DIFF_7D', 7, 'DAY', 'LAST', 'PREVIOUS_PERIOD', '<=', -0.15, '%',  '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(6,  'RISK_SCORE',      1, 'DAY', 'LAST', 'NONE', '>=', 75.0, 'POINT',             '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(7,  'DAYS_SINCE_VISIT',1, 'DAY', 'LAST', 'NONE', '>=', 60.0, 'DAY',               '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(8,  'OVERDUE_ACTION_CNT', 30, 'DAY', 'SUM', 'NONE', '>=', 1.0, 'COUNT',           '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(9,  'STORE_OPERATION_STATUS', 1, 'DAY', 'LAST', 'NONE', '=', 1.0, 'FLAG',          '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09'),
(10, 'OPEN_PLANNED_AT', 1, 'DAY', 'LAST', 'NONE', '=', 1.0, 'FLAG',                '2025-08-01 09:00:00+09', '2025-08-01 09:00:00+09');


/* =========================================================
   4) event_log (20)
   - assigned_to_user_id: sv02 고정
   - store_id=6 이벤트 유지(조치 없음)
   - store_id=4,5,30 이벤트 강화(조치 연결 예정)
   ========================================================= */
WITH u AS (
  SELECT (SELECT user_id FROM users WHERE login_id='sv02') AS sv02_id
)
INSERT INTO event_log (
  rule_id, store_id, assigned_to_user_id,
  event_type, occurred_at, severity, summary,
  related_entity_type, related_entity_id,
  status, first_occurred_at, last_occurrence_at, occurrence_count,
  last_notified_at
)
VALUES
/* ---------- store_id=6 (이벤트만, 조치 X) ---------- */
(1,  6, (SELECT sv02_id FROM u),  'POS_SALES_DROP',   '2025-08-20 09:15:00+09', 'CRITICAL',
 '최근 7일 매출 성장률 급락 감지', 'pos', NULL,
 'OPEN', '2025-08-20 09:15:00+09', '2025-08-20 09:15:00+09', 1, '2025-08-20 09:20:00+09'),

(2,  6, (SELECT sv02_id FROM u),  'POS_ORDER_DROP',   '2025-08-20 09:17:00+09', 'WARNING',
 '최근 7일 주문수 감소 감지', 'pos', NULL,
 'ACK',  '2025-08-19 09:10:00+09', '2025-08-20 09:17:00+09', 2, '2025-08-20 09:25:00+09'),

/* ---------- store_id=4 (고진아 담당) ---------- */
(1,  4, (SELECT sv02_id FROM u),  'POS_SALES_DROP',   '2025-08-18 10:05:00+09', 'CRITICAL',
 '최근 7일 매출 성장률 급락 감지', 'pos', NULL,
 'OPEN', '2025-08-18 10:05:00+09', '2025-08-18 10:05:00+09', 1, '2025-08-18 10:10:00+09'),

(5,  4, (SELECT sv02_id FROM u),  'POS_MARGIN_DROP',  '2025-08-19 19:40:00+09', 'WARNING',
 '마진율 하락 감지', 'pos', NULL,
 'ACK',  '2025-08-18 19:40:00+09', '2025-08-19 19:40:00+09', 2, '2025-08-19 19:42:00+09'),

/* ---------- store_id=5 (고진아 담당) ---------- */
(3,  5, (SELECT sv02_id FROM u),  'QSC_SCORE_DROP',   '2025-08-17 14:05:00+09', 'WARNING',
 '직전 QSC 대비 점수 하락 감지', 'qsc', 10021,
 'OPEN', '2025-08-17 14:05:00+09', '2025-08-17 14:05:00+09', 1, '2025-08-17 14:07:00+09'),

(4,  5, (SELECT sv02_id FROM u),  'QSC_FAIL',         '2025-08-16 11:40:00+09', 'CRITICAL',
 'QSC 불합격 판정 발생', 'qsc', 10018,
 'OPEN', '2025-08-16 11:40:00+09', '2025-08-16 11:40:00+09', 1, '2025-08-16 11:45:00+09'),

/* ---------- store_id=30 (고진아 담당) ---------- */
(6, 30, (SELECT sv02_id FROM u),  'RISK_SCORE_SPIKE', '2025-08-21 08:05:00+09', 'CRITICAL',
 'Risk Score 고위험 구간 진입', 'risk', 501,
 'OPEN', '2025-08-21 08:05:00+09', '2025-08-21 08:05:00+09', 1, '2025-08-21 08:06:00+09'),

(7, 30, (SELECT sv02_id FROM u),  'VISIT_GAP_RISK',   '2025-08-15 09:00:00+09', 'WARNING',
 'SV 방문 공백 임계치 초과 감지', 'visit', NULL,
 'ACK',  '2025-08-08 09:00:00+09', '2025-08-15 09:00:00+09', 3, '2025-08-15 09:05:00+09'),

/* ---------- 기타 지점(시연 다양성) ---------- */
(8,  56, (SELECT sv02_id FROM u),  'ACTION_OVERDUE',   '2025-08-22 09:10:00+09', 'WARNING',
 '조치(Action) 기한 초과 항목 존재', 'action', 30012,
 'OPEN', '2025-08-22 09:10:00+09', '2025-08-22 09:10:00+09', 1, '2025-08-22 09:12:00+09'),

(9,  49, (SELECT sv02_id FROM u),  'CONTRACT_EXPIRED', '2025-08-15 00:10:00+09', 'INFO',
 '계약/운영 상태 변경 감지', 'store', 49,
 'CLOSED','2025-08-15 00:10:00+09', '2025-08-15 00:10:00+09', 1, NULL),

(10, 73, (SELECT sv02_id FROM u), 'OPEN_PLANNED',     '2025-08-20 16:00:00+09', 'INFO',
 '오픈 예정 점포 사전 준비 필요', 'store', 73,
 'OPEN', '2025-08-20 16:00:00+09', '2025-08-20 16:00:00+09', 1, '2025-08-20 16:05:00+09'),

(2,  65, (SELECT sv02_id FROM u), 'POS_ORDER_DROP',   '2025-08-20 12:10:00+09', 'WARNING',
 '최근 7일 주문수 급감 감지', 'pos', NULL,
 'OPEN', '2025-08-19 12:10:00+09', '2025-08-20 12:10:00+09', 2, '2025-08-20 12:12:00+09'),

(5,  88, (SELECT sv02_id FROM u), 'POS_MARGIN_DROP',  '2025-08-18 20:10:00+09', 'WARNING',
 '원가/할인 영향으로 마진 악화 감지', 'pos', NULL,
 'ACK',  '2025-08-17 20:10:00+09', '2025-08-18 20:10:00+09', 2, '2025-08-18 20:12:00+09'),

(4,  84, (SELECT sv02_id FROM u), 'QSC_FAIL',         '2025-08-16 13:55:00+09', 'CRITICAL',
 'QSC 불합격 발생 - 재점검 권고', 'qsc', 10077,
 'OPEN', '2025-08-16 13:55:00+09', '2025-08-16 13:55:00+09', 1, '2025-08-16 14:00:00+09'),

(3,  90, (SELECT sv02_id FROM u), 'QSC_SCORE_DROP',   '2025-08-21 18:20:00+09', 'WARNING',
 'QSC 점수 하락 감지', 'qsc', 10111,
 'ACK',  '2025-08-20 18:20:00+09', '2025-08-21 18:20:00+09', 2, '2025-08-21 18:25:00+09'),

(10, 80, (SELECT sv02_id FROM u), 'OPEN_PLANNED',     '2025-08-22 15:00:00+09', 'INFO',
 '오픈 예정 점포 사전 체크 필요', 'store', 80,
 'OPEN', '2025-08-22 15:00:00+09', '2025-08-22 15:00:00+09', 1, '2025-08-22 15:02:00+09'),

(1,  74, (SELECT sv02_id FROM u), 'POS_SALES_DROP',   '2025-08-22 08:00:00+09', 'CRITICAL',
 '매출 급락 감지', 'pos', NULL,
 'OPEN', '2025-08-22 08:00:00+09', '2025-08-22 08:00:00+09', 1, '2025-08-22 08:01:00+09'),

(7,  31, (SELECT sv02_id FROM u), 'VISIT_GAP_WATCH',  '2025-08-20 10:00:00+09', 'INFO',
 'SV 방문 공백 감지', 'visit', NULL,
 'OPEN', '2025-08-20 10:00:00+09', '2025-08-20 10:00:00+09', 1, '2025-08-20 10:05:00+09'),

(8,  28, (SELECT sv02_id FROM u), 'ACTION_OVERDUE',   '2025-08-19 09:40:00+09', 'WARNING',
 '조치 기한초과 누적 감지', 'action', 30055,
 'ACK',  '2025-08-18 09:40:00+09', '2025-08-19 09:40:00+09', 2, '2025-08-19 09:42:00+09');


/* =========================================================
   5) actions (고진아 담당점 4,5,30 포함 / store_id=6 제외)
   - created_by: leader01
   - assigned_to: sv02
   - related_event_id는 event_log INSERT 순서(event_id 1~20) 기준
     event_id 매핑(이번 insert 순서 기준):
       1: (6,r1)  2:(6,r2)
       3:(4,r1)  4:(4,r5)
       5:(5,r3)  6:(5,r4)
       7:(30,r6) 8:(30,r7)
       9:(56,r8) 10:(49,r9) 11:(73,r10) 12:(65,r2)
       13:(88,r5) 14:(84,r4) 15:(90,r3) 16:(80,r10)
       17:(74,r1) 18:(31,r7) 19:(28,r8)
   ========================================================= */
WITH u AS (
  SELECT
    (SELECT user_id FROM users WHERE login_id='sv02')     AS sv02_id,
    (SELECT user_id FROM users WHERE login_id='leader01') AS leader_id
)
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
/* --- store_id=4 --- */
(4, 3, 'VISIT', '매출 급락 원인 점검',
 '매출 급락 감지: 피크 운영/품절/채널 유입 점검 및 개선안 수립',
 'CRITICAL', 'OPEN', 'POS_SALES', '2025-08-22',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-18 10:10:00+09', '2025-08-18 10:10:00+09'),

(4, 4, 'VISIT', '마진율 하락 원인 점검',
 '마진 악화 감지: 원가/할인/폐기/레시피 준수 여부 점검',
 'HIGH', 'IN_PROGRESS', 'POS_MARGIN', '2025-08-23',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-19 20:00:00+09', '2025-08-19 20:00:00+09'),

/* --- store_id=5 --- */
(5, 5, 'REINSPECTION', 'QSC 하락 항목 개선 및 재점검',
 'QSC 하락 감지: 취약 항목 개선 후 재점검 및 교육 수행',
 'HIGH', 'OPEN', 'QSC_TOTAL', '2025-08-21',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-17 14:10:00+09', '2025-08-17 14:10:00+09'),

(5, 6, 'REINSPECTION', 'QSC 불합격 시정조치 및 재점검',
 '불합격 발생: 시정조치 완료 후 재점검 일정 확정',
 'CRITICAL', 'OPEN', 'QSC_TOTAL', '2025-08-20',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-16 11:50:00+09', '2025-08-16 11:50:00+09'),

/* --- store_id=30 --- */
(30, 7, 'VISIT', 'Risk Score 급등 대응 점검',
 'Risk Score 고위험 구간 진입: 원인 항목 확인 및 단기 대응 플랜 수립',
 'CRITICAL', 'OPEN', 'RISK_SCORE', '2025-08-24',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-21 08:10:00+09', '2025-08-21 08:10:00+09'),

(30, 8, 'VISIT', '방문 공백 해소 및 체크리스트 점검',
 '방문 공백 감지: 방문 일정 확정 및 운영 점검 수행',
 'HIGH', 'IN_PROGRESS', 'VISIT_GAP_DAYS', '2025-08-25',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-15 09:10:00+09', '2025-08-15 09:10:00+09'),

/* --- 기타 지점 예시(시연 다양성) --- */
(84, 14, 'REINSPECTION', 'QSC 불합격 후 재점검 계획 수립',
 '불합격 발생: 시정조치 및 재점검 일정 확정',
 'CRITICAL', 'OPEN', 'QSC_TOTAL', '2025-08-19',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-16 14:10:00+09', '2025-08-16 14:10:00+09'),

(56, 9, 'REINSPECTION', '기한초과 조치 정리 및 재기한 설정',
 '기한초과 조치 존재: 미이행 사유 파악 후 재할당/재기한 설정',
 'HIGH', 'OPEN', 'ACTION_OVERDUE', '2025-08-26',
 (SELECT sv02_id FROM u), (SELECT leader_id FROM u),
 '2025-08-22 09:12:00+09', '2025-08-22 09:12:00+09');


/* =========================================================
   6) action_results (actions 8개에 맞춰 8개)
   - created_by: sv02
   ========================================================= */
WITH u AS (
  SELECT (SELECT user_id FROM users WHERE login_id='sv02') AS sv02_id
)
INSERT INTO action_results (
  action_id, created_by_user_id,
  performed_at, result_comment, created_at
)
VALUES
(1, (SELECT sv02_id FROM u), '2025-08-19 11:00:00+09', '원인: 피크 인력 부족/품절 발생. 인력 재배치 및 발주 기준 조정', '2025-08-19 11:10:00+09'),
(2, (SELECT sv02_id FROM u), '2025-08-20 10:20:00+09', '원인: 할인 과다/폐기 증가. 할인 정책 조정 및 폐기 기준 강화', '2025-08-20 10:30:00+09'),
(3, (SELECT sv02_id FROM u), '2025-08-18 15:00:00+09', '조치: 위생/서비스 취약 항목 개선 가이드 전달 및 재교육 완료', '2025-08-18 15:10:00+09'),
(4, (SELECT sv02_id FROM u), '2025-08-18 16:00:00+09', '시정조치 완료 및 재점검 일정 확정', '2025-08-18 16:10:00+09'),
(5, (SELECT sv02_id FROM u), '2025-08-22 09:30:00+09', '원인 점검 완료: 리스크 요인 확인 및 개선 체크리스트 적용', '2025-08-22 09:40:00+09'),
(6, (SELECT sv02_id FROM u), '2025-08-16 11:00:00+09', '방문 공백 해소: 운영 점검 및 후속 방문 일정 확정', '2025-08-16 11:10:00+09'),
(7, (SELECT sv02_id FROM u), '2025-08-17 16:30:00+09', '시정조치 완료(위생/안전) 및 재점검 준비 완료', '2025-08-17 16:40:00+09'),
(8, (SELECT sv02_id FROM u), '2025-08-23 14:00:00+09', '기한초과 조치 정리: 우선순위 재설정 후 담당 재지정', '2025-08-23 14:05:00+09');


/* =========================================================
   7) action_attachments
   - action_results 중 첫 result_id(=1)에 3장 생성
   - 업로더: sv02
   ========================================================= */
WITH u AS (
  SELECT (SELECT user_id FROM users WHERE login_id='sv02') AS sv02_id
)
INSERT INTO action_attachments (
  result_id, upload_by_user_id, photo_url, photo_name, created_at
)
VALUES
(1, (SELECT sv02_id FROM u), 'https://s3.amazonaws.com/test-bucket/action/seed/photo1.jpg', 'before.jpg', '2025-08-19 11:30:00'),
(1, (SELECT sv02_id FROM u), 'https://s3.amazonaws.com/test-bucket/action/seed/photo2.jpg', 'after.jpg',  '2025-08-19 11:31:00'),
(1, (SELECT sv02_id FROM u), 'https://s3.amazonaws.com/test-bucket/action/seed/photo3.jpg', 'check.jpg',  '2025-08-19 11:32:00');