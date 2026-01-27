package com.franchise.backend.user.dto;

import com.franchise.backend.user.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthUserResponse {  // 로그인 성공 응답
    private Long userId;
    private String userName;
    private Role role;
    private String loginId;
    private String department;
    private String region;
}
