package com.franchise.backend.user.controller;

import com.franchise.backend.common.response.ApiResponse;
import com.franchise.backend.user.dto.AuthUserResponse;
import com.franchise.backend.user.dto.CheckLoginIdResponse;
import com.franchise.backend.user.dto.LoginRequest;
import com.franchise.backend.user.dto.SignupRequest;
import com.franchise.backend.user.security.JwtProperties;
import com.franchise.backend.user.security.JwtTokenProvider;
import com.franchise.backend.user.security.UserPrincipal;
import com.franchise.backend.user.service.UserAuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class UserAuthController {

    private final UserAuthService userAuthService;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtProperties jwtProperties;

    @GetMapping("/check-loginId")
    public ApiResponse<CheckLoginIdResponse> checkLoginId(@RequestParam String loginId) {
        boolean available = userAuthService.isLoginIdAvailable(loginId);
        return ApiResponse.ok(new CheckLoginIdResponse(available));
    }

    @PostMapping("/signup")
    public ApiResponse<Long> signup(@RequestBody SignupRequest request) {
        Long userId = userAuthService.signup(request);
        return ApiResponse.ok(userId);
    }

    @PostMapping("/login")
    public ApiResponse<AuthUserResponse> login(
            @RequestBody LoginRequest request,
            HttpServletResponse response
    ) {
        AuthUserResponse user = userAuthService.login(request);

        String accessToken = jwtTokenProvider.createAccessToken(
                user.getUserId(),
                user.getLoginId(),
                user.getRole()
        );

        // HTTPOnly Cookie 세팅
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.getCookie().getName(), accessToken)
                .httpOnly(true)
                .secure(jwtProperties.getCookie().isSecure())
                .path("/")
                .sameSite(jwtProperties.getCookie().getSameSite())
                // access token 만료와 쿠키 만료를 맞춤
                .maxAge(jwtProperties.getAccessTokenExpMinutes() * 60L)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.ok(user);
    }

    // 로그인 상태 확인 / 내 정보 조회
    // - 쿠키(ACCESS_TOKEN)로 인증된 상태에서만 호출 가능
    @GetMapping("/me")
    public ApiResponse<AuthUserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
        // principal은 JwtAuthenticationFilter가 SecurityContext에 넣어줌
        AuthUserResponse me = userAuthService.me(principal.getLoginId());
        return ApiResponse.ok(me);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {

        // 쿠키 제거 (maxAge=0)
        ResponseCookie cookie = ResponseCookie.from(jwtProperties.getCookie().getName(), "")
                .httpOnly(true)
                .secure(jwtProperties.getCookie().isSecure())
                .path("/")
                .sameSite(jwtProperties.getCookie().getSameSite())
                .maxAge(0)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ApiResponse.ok(null);
    }
}
