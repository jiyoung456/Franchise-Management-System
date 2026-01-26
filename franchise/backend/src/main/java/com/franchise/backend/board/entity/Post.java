package com.franchise.backend.board.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "board_post")
public class Post {

    // PK: post_id (bigserial)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    // FK: created_by_user_id (지금은 일단 Long으로만)
    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    // FK: updated_by_user_id
    @Column(name = "updated_by_user_id")
    private Long updatedByUserId;

    // title (varchar)
    @Column(nullable = false, length = 255)
    private String title;

    // content (text)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // is_pinned (boolean)
    @Column(name = "is_pinned", nullable = false)
    private Boolean isPinned = false;

    // view_count (int, not null, default)
    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    // created_at (timestamp)
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // updated_at (timestamp)
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 게시글 생성용 생성자
    public Post(String title, String content, Long userId) {
        this.title = title;
        this.content = content;
        this.createdByUserId = userId;
        this.updatedByUserId = userId;
    }

    // 저장 직전 자동 실행
    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    // 수정 직전 자동 실행
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 게시글 수정
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
    }

    // 조회수 증가
    public void increaseViewCount() {
        this.viewCount++;
    }

    // 상단 고정 설정
    public void pin() {
        this.isPinned = true;
    }

    public void unpin() {
        this.isPinned = false;
    }
}
