package com.franchise.backend.briefing.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "agent_briefing")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AgentBriefings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "briefing_id")
    private Long briefingId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "audience_role", nullable = false)
    private String audienceRole;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "generate_at", nullable = false)
    private LocalDateTime generateAt;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "top_store_json", columnDefinition = "jsonb")
    private Map<String, Object> topStoreJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "focus_point_json", columnDefinition = "jsonb")
    private Map<String, Object> focusPointJson;

    @Column(name = "summary_text", columnDefinition = "text")
    private String summaryText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "focus_point_json_checked", columnDefinition = "jsonb")
    private Map<String, Object> focusPointJsonChecked;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

