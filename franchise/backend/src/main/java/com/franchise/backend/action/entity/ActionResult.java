package com.franchise.backend.action.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "action_results")
public class ActionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long id;

    // ERD: action_id (UNIQUE)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", nullable = false, unique = true)
    private Action action;

    @Column(name = "created_by_user_id", nullable = false)
    private Long createdByUserId;

    @Column(name = "performed_at")
    private LocalDateTime performedAt; // 수행일

    @Column(name = "result_comment", columnDefinition = "TEXT")
    private String resultComment; // 조치 결과 코멘트

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // 첨부사진들
    @OneToMany(mappedBy = "actionResult", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ActionAttachment> attachments = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public ActionResult(Action action, Long createdByUserId, LocalDateTime performedAt, String resultComment) {
        this.action = action;
        this.createdByUserId = createdByUserId;
        this.performedAt = performedAt;
        this.resultComment = resultComment;
    }

    public void update(LocalDateTime performedAt, String resultComment) {
        this.performedAt = performedAt;
        this.resultComment = resultComment;
    }
}
