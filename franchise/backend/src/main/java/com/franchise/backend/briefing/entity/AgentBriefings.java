package com.franchise.backend.briefing.entity;

import com.franchise.backend.briefing.dto.BriefingResponse;
import com.franchise.backend.briefing.dto.FocusPointJsonCheckedDto;
import com.franchise.backend.briefing.dto.FocusPointJsonDto;
import com.franchise.backend.briefing.dto.TopStoreJsonDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
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
    private TopStoreJsonDto topStoreJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "focus_point_json", columnDefinition = "jsonb")
    private List<FocusPointJsonDto> focusPointJson;

    @Column(name = "summary_text", columnDefinition = "text")
    private String summaryText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "focus_point_json_checked", columnDefinition = "jsonb")
    private List<FocusPointJsonCheckedDto> focusPointJsonChecked;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public AgentBriefings(
            Long userId,
            String audienceRole,
            BriefingResponse response
    ) {
        this.userId = userId;
        this.audienceRole = audienceRole;
        this.targetDate = response.getTargetDate();
        this.generateAt = response.getGenerateAt();
        this.summaryText = response.getSummaryText();
        this.focusPointJson = response.getFocusPointJson();
        this.focusPointJsonChecked = response.getFocusPointJsonChecked();
        this.topStoreJson = response.getTopStroeJson();
    }
}

