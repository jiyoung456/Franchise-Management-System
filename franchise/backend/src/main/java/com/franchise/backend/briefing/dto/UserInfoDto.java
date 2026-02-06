package com.franchise.backend.briefing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.franchise.backend.user.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class UserInfoDto {

    @JsonProperty("user_id")
    private Long userId;

    private Role role;
    private String department;

    public UserInfoDto(Long userId, Role role, String department) {
        this.userId = userId;
        this.role = role;
        this.department = department;
    }
}
