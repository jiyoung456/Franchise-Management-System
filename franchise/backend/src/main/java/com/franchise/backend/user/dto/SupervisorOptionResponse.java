package com.franchise.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SupervisorOptionResponse {
    private String loginId;
    private String userName;
    private String department; // 소속팀
    private String region;
}
