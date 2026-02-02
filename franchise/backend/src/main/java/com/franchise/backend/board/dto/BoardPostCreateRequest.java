package com.franchise.backend.board.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BoardPostCreateRequest {
    private String title;
    private String content;
    private Boolean isPinned; // 선택: 없으면 false 처리
}
