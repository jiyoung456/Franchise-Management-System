package com.franchise.backend.user.dto;

import com.franchise.backend.user.entity.Role;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class LoginRequest {

    // "SUPERVISOR" / "MANAGER" / "ADMIN"
    private Role role;

    private String loginId;
    private String password;
}
