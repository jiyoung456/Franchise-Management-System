package com.franchise.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CheckLoginIdResponse {  // 아이디 중복확인 응답
    private boolean available;
}
