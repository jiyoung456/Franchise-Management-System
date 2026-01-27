package com.franchise.backend.user.dto;

import com.franchise.backend.user.entity.Role;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SignupRequest {

    private Role role;          // ADMIN / MANAGER / SUPERVISOR
    private String loginId;
    private String password;
    private String passwordConfirm;

    private String userName;
    private String email;

    private String region;      // 예: 서울/경기, 부산/경남 ... (ADMIN은 ALL 가능)
    private String department;  // 예: 운영1팀, 운영2팀, 운영3팀, 가맹관리팀, 품질관리팀
}
