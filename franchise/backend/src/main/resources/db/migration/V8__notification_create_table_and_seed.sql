-- 1. notification_group 테이블 생성
CREATE TABLE notification_group (
    group_id BIGSERIAL PRIMARY KEY,
    dedup_key VARCHAR(255) UNIQUE,
    user_id BIGINT NOT NULL,
    store_id BIGINT,
    rule_id BIGINT,

    status VARCHAR(20) NOT NULL,
    escalation_step INTEGER DEFAULT 0,

    first_occurred_at TIMESTAMP NOT NULL,
    last_occurrence_at TIMESTAMP NOT NULL,
    last_notified_at TIMESTAMP,
    occurrence_count INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. notification 테이블 생성
CREATE TABLE notification (
    notification_id BIGSERIAL PRIMARY KEY,
    group_id BIGINT NOT NULL,
    event_id BIGINT,
    user_id BIGINT NOT NULL,

    noti_type VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT fk_notification_group
        FOREIGN KEY (group_id) REFERENCES notification_group(group_id)
);

-- 3. notification_group 더미 데이터
INSERT INTO notification_group
(dedup_key, user_id, store_id, rule_id, status, escalation_step,
 first_occurred_at, last_occurrence_at, last_notified_at, occurrence_count)
VALUES
('1_1', 1, 1, 1, 'OPEN', 0, now() - interval '2 day', now() - interval '10 minute', now() - interval '10 minute', 3),
('2_2', 1, 2, 2, 'OPEN', 1, now() - interval '1 day', now() - interval '1 hour', now() - interval '1 hour', 2),
('3_3', 1, 3, 3, 'OPEN', 0, now() - interval '3 day', now() - interval '5 minute', now() - interval '5 minute', 5);

-- 4. notification 더미 데이터
INSERT INTO notification
(group_id, event_id, user_id, noti_type, title, body, is_read, created_at)
VALUES
(1, 1, 1, 'INITIAL', '홍대입구점',
 '주방 위생 카테고리 점수 급락 (-15점)', false, now() - interval '25 minute'),

(1, 2, 1, 'REMIND', '홍대입구점',
 '위생 점수 하락 상태가 계속 유지되고 있습니다.', false, now() - interval '10 minute'),

(2, 3, 1, 'INITIAL', '부산서면점',
 '정기 점검 결과 C 등급 (불합격)', false, now() - interval '1 hour'),

(3, 4, 1, 'INITIAL', '광주수완점',
 '정기 점검 결과 C 등급 (불합격)', true, now() - interval '5 hour');
