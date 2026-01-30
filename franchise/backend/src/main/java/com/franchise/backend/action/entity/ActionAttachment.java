package com.franchise.backend.action.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "action_attachments")
public class ActionAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "attachment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_id", nullable = false)
    private ActionResult actionResult;

    @Column(name = "upload_by_user_id", nullable = false)
    private Long uploadByUserId;

    @Column(name = "photo_url", nullable = false, length = 500)
    private String photoUrl; // S3 경로

    @Column(name = "photo_name", length = 255)
    private String photoName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public ActionAttachment(ActionResult actionResult, Long uploadByUserId, String photoUrl, String photoName) {
        this.actionResult = actionResult;
        this.uploadByUserId = uploadByUserId;
        this.photoUrl = photoUrl;
        this.photoName = photoName;
    }
}
