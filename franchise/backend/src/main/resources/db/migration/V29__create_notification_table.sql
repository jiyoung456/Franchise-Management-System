/* =========================================================
   V__create_notification_tables.sql  (PostgreSQL / Flyway)
   notification_group, notification, notification_decision_log
   ========================================================= */

-- 0) noti_type ENUM(문자열 + CHECK로 고정)
-- INITIAL / REMIND / ESCALATION

/* =========================================================
   1) notification_group
   - 이슈(중복) 그룹: store_id + rule_id + user_id 조합으로 관리
   - dedup_key는 유니크
   ========================================================= */
CREATE TABLE IF NOT EXISTS notification_group (
  group_id            BIGSERIAL PRIMARY KEY,

  dedup_key           VARCHAR(200) NOT NULL, -- 예: storeId:ruleId:userId 형태

  user_id             BIGINT NOT NULL,
  store_id            BIGINT NOT NULL,
  rule_id             BIGINT NOT NULL,

  status              VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- OPEN/ACK/CLOSED 등(원하면 확장)
  escalation_step     INT NOT NULL DEFAULT 0,              -- 0:초기, 1:재알림, 2:에스컬

  first_occurred_at   TIMESTAMPTZ NOT NULL,
  last_occurrence_at  TIMESTAMPTZ NOT NULL,
  last_notified_at    TIMESTAMPTZ NULL,
  occurrence_count    INT NOT NULL DEFAULT 1 CHECK (occurrence_count >= 1),

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_notification_group_dedup UNIQUE (dedup_key),

  CONSTRAINT fk_notification_group_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  CONSTRAINT fk_notification_group_store
    FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE,

  CONSTRAINT fk_notification_group_rule
    FOREIGN KEY (rule_id) REFERENCES event_rule(rule_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS ix_notification_group_user_updated
  ON notification_group (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS ix_notification_group_store_rule
  ON notification_group (store_id, rule_id);


/* =========================================================
   2) notification
   - 실제 사용자에게 전달된 알림 1건
   ========================================================= */
CREATE TABLE IF NOT EXISTS notification (
  notification_id  BIGSERIAL PRIMARY KEY,

  group_id         BIGINT NOT NULL,
  event_id         BIGINT NULL,
  user_id          BIGINT NOT NULL,

  noti_type        VARCHAR(20) NOT NULL,   -- INITIAL/REMIND/ESCALATION
  title            VARCHAR(255) NOT NULL,
  body             TEXT NOT NULL,

  is_read          BOOLEAN NOT NULL DEFAULT FALSE,
  read_at          TIMESTAMPTZ NULL,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_notification_group
    FOREIGN KEY (group_id) REFERENCES notification_group(group_id) ON DELETE CASCADE,

  CONSTRAINT fk_notification_event
    FOREIGN KEY (event_id) REFERENCES event_log(event_id) ON DELETE SET NULL,

  CONSTRAINT fk_notification_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  CONSTRAINT chk_notification_noti_type
    CHECK (noti_type IN ('INITIAL','REMIND','ESCALATION'))
);

CREATE INDEX IF NOT EXISTS ix_notification_user_created
  ON notification (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_notification_user_unread
  ON notification (user_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS ix_notification_group_created
  ON notification (group_id, created_at DESC);


/* =========================================================
   3) notification_decision_log
   - 알림 판단 로직의 결과 기록(선택)
   ========================================================= */
CREATE TABLE IF NOT EXISTS notification_decision_log (
  decision_id     BIGSERIAL PRIMARY KEY,

  group_id        BIGINT NOT NULL,
  event_id        BIGINT NULL,
  user_id         BIGINT NOT NULL,

  decision        VARCHAR(20) NOT NULL,  -- SENT / SUPPRESSED
  reason_code     VARCHAR(100) NULL,     -- 예: DEDUP_OPEN_ACK, COOLDOWN, NOT_ELIGIBLE...

  evaluated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_decision_group
    FOREIGN KEY (group_id) REFERENCES notification_group(group_id) ON DELETE CASCADE,

  CONSTRAINT fk_decision_event
    FOREIGN KEY (event_id) REFERENCES event_log(event_id) ON DELETE SET NULL,

  CONSTRAINT fk_decision_user
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,

  CONSTRAINT chk_decision_value
    CHECK (decision IN ('SENT','SUPPRESSED'))
);

CREATE INDEX IF NOT EXISTS ix_decision_group_time
  ON notification_decision_log (group_id, evaluated_at DESC);

CREATE INDEX IF NOT EXISTS ix_decision_user_time
  ON notification_decision_log (user_id, evaluated_at DESC);
