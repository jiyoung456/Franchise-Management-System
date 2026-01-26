package com.franchise.backend.board.dto;

import java.time.LocalDateTime;

public class BoardPostListResponse {
    private Long id;                 // 번호
    private String title;            // 제목
    private Long createdByUserId;    // 작성자(일단 id로)
    private LocalDateTime createdAt; // 작성일
    private Integer viewCount;       // 조회수
    private Boolean isPinned;        // 중요(고정)

    public BoardPostListResponse(Long id, String title, Long createdByUserId,
                                 LocalDateTime createdAt, Integer viewCount, Boolean isPinned) {
        this.id = id;
        this.title = title;
        this.createdByUserId = createdByUserId;
        this.createdAt = createdAt;
        this.viewCount = viewCount;
        this.isPinned = isPinned;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Integer getViewCount() { return viewCount; }
    public Boolean getIsPinned() { return isPinned; }
}
