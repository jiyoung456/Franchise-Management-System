package com.franchise.backend.board.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class BoardPostUpdateRequest {
    private String title;
    private String content;
    private Boolean isPinned; // 선택: null이면 기존값 유지할지/false로 할지 정책 선택 가능
}
