CREATE TABLE action_attachments (
  attachment_id BIGSERIAL PRIMARY KEY,
  result_id BIGINT NOT NULL,
  upload_by_user_id BIGINT NOT NULL,
  photo_url VARCHAR(500) NOT NULL,
  photo_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_action_attachments_action_result
    FOREIGN KEY (result_id)
    REFERENCES action_results(result_id)
    ON DELETE CASCADE
);

CREATE INDEX idx_action_attachments_result_id
  ON action_attachments(result_id);
