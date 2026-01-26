package com.franchise.backend.board.dto;

import java.time.LocalDateTime;

public class BoardPostDetailResponse {
    private Long id;
    private String title;
    private String content;
    private Long createdByUserId;
    private LocalDateTime createdAt;
    private Integer viewCount;
    private Boolean isPinned;

    public BoardPostDetailResponse(Long id, String title, String content, Long createdByUserId,
                                   LocalDateTime createdAt, Integer viewCount, Boolean isPinned) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdByUserId = createdByUserId;
        this.createdAt = createdAt;
        this.viewCount = viewCount;
        this.isPinned = isPinned;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public Long getCreatedByUserId() { return createdByUserId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Integer getViewCount() { return viewCount; }
    public Boolean getIsPinned() { return isPinned; }
}
