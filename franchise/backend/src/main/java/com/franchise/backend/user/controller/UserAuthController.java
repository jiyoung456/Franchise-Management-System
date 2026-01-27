package com.franchise.backend.user.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.user.dto.AuthUserResponse;
import com.franchise.backend.user.dto.CheckLoginIdResponse;
import com.franchise.backend.user.dto.LoginRequest;
import com.franchise.backend.user.dto.SignupRequest;
import com.franchise.backend.user.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class UserAuthController {

    private final UserAuthService userAuthService;

    // 아이디 중복 확인
    @GetMapping("/check-loginId")
    public ApiResponse<CheckLoginIdResponse> checkLoginId(@RequestParam String loginId) {
        boolean available = userAuthService.isLoginIdAvailable(loginId);
        return ApiResponse.ok(new CheckLoginIdResponse(available));
    }

    // 회원가입
    @PostMapping("/signup")
    public ApiResponse<Long> signup(@RequestBody SignupRequest request) {
        Long userId = userAuthService.signup(request);
        return ApiResponse.ok(userId);
    }

    // 로그인
    @PostMapping("/login")
    public ApiResponse<AuthUserResponse> login(@RequestBody LoginRequest request) {
        AuthUserResponse user = userAuthService.login(request.getLoginId(), request.getPassword());
        return ApiResponse.ok(user);
    }
}
