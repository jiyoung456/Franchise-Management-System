CREATE TABLE qsc_comment_analysis (
    analysis_id        BIGSERIAL PRIMARY KEY,
    inspection_id      BIGINT NOT NULL,

    source_text        TEXT NOT NULL,
    topic_json         JSONB,
    keyword_json       JSONB,
    summary            TEXT,
    raw_response_json  JSONB,

    model_name         VARCHAR(100),
    prompt_version     VARCHAR(50),

    analyzed_at        TIMESTAMP,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_qsc_analysis_inspection
        FOREIGN KEY (inspection_id)
        REFERENCES qsc_master(inspection_id)
);

CREATE INDEX idx_qsc_analysis_inspection ON qsc_comment_analysis(inspection_id);


CREATE TABLE agent_briefings (
    briefing_id        BIGSERIAL PRIMARY KEY,
    user_id            BIGINT NOT NULL,

    audience_role      VARCHAR(20) NOT NULL,
    target_date        DATE NOT NULL,
    generate_at        TIMESTAMP,

    top_store_json     JSONB,
    focus_point_json   JSONB,
    summary_text       TEXT,
    focus_point_json_checked JSONB,

    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_agent_briefings_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

CREATE INDEX idx_agent_briefings_user ON agent_briefings(user_id);
CREATE INDEX idx_agent_briefings_target_date ON agent_briefings(target_date);

