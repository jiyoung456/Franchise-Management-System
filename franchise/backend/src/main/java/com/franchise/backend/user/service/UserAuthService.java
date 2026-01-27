package com.franchise.backend.user.service;

import com.franchise.backend.user.dto.AuthUserResponse;
import com.franchise.backend.user.dto.LoginRequest;
import com.franchise.backend.user.dto.SignupRequest;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public boolean isLoginIdAvailable(String loginId) {
        return !userRepository.existsByLoginId(loginId);
    }

    @Transactional
    public Long signup(SignupRequest req) {
        validateSignup(req);

        if (userRepository.existsByLoginId(req.getLoginId())) {
            throw new IllegalArgumentException("이미 사용 중인 아이디입니다.");
        }
        if (req.getEmail() != null && userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("이미 사용 중인 이메일입니다.");
        }

        String region = req.getRegion();
        String department = req.getDepartment();

        if (req.getRole() == Role.ADMIN) {
            if (department == null || department.isBlank()) department = "운영본부";
            if (region == null || region.isBlank()) region = "ALL";
        }

        String encodedPassword = passwordEncoder.encode(req.getPassword());

        User user = User.create(
                req.getUserName(),
                req.getRole(),
                req.getLoginId(),
                encodedPassword,
                department,
                req.getEmail(),
                region
        );

        return userRepository.save(user).getId();
    }

    @Transactional
    public AuthUserResponse login(LoginRequest request) {
        validateLoginRequest(request);

        User user = userRepository.findByLoginId(request.getLoginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (Boolean.FALSE.equals(user.getAccountStatus())) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        // 1) 비밀번호 검증 (BCrypt)
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        // 2) 탭(role) 검증: 선택 role != 실제 role 이면 거부
        if (request.getRole() != user.getRole()) {
            throw new IllegalArgumentException("선택한 로그인 유형과 계정 권한이 일치하지 않습니다.");
        }

        user.markLoginSuccess(LocalDateTime.now());

        return new AuthUserResponse(
                user.getId(),
                user.getUserName(),
                user.getRole(),
                user.getLoginId(),
                user.getDepartment(),
                user.getRegion()
        );
    }


    // 내 정보 조회 (로그인 유지 확인용)
    @Transactional(readOnly = true)
    public AuthUserResponse me(String loginId) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (Boolean.FALSE.equals(user.getAccountStatus())) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        return new AuthUserResponse(
                user.getId(),
                user.getUserName(),
                user.getRole(),
                user.getLoginId(),
                user.getDepartment(),
                user.getRegion()
        );
    }

    private void validateSignup(SignupRequest req) {
        if (req.getRole() == null) throw new IllegalArgumentException("role은 필수입니다.");
        if (isBlank(req.getLoginId())) throw new IllegalArgumentException("아이디는 필수입니다.");
        if (isBlank(req.getPassword())) throw new IllegalArgumentException("비밀번호는 필수입니다.");
        if (isBlank(req.getPasswordConfirm())) throw new IllegalArgumentException("비밀번호 확인은 필수입니다.");
        if (!req.getPassword().equals(req.getPasswordConfirm())) {
            throw new IllegalArgumentException("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }
        if (isBlank(req.getUserName())) throw new IllegalArgumentException("이름은 필수입니다.");
        if (isBlank(req.getEmail())) throw new IllegalArgumentException("이메일은 필수입니다.");

        if (req.getRole() == Role.SUPERVISOR || req.getRole() == Role.MANAGER) {
            if (isBlank(req.getRegion())) throw new IllegalArgumentException("담당 지역은 필수입니다.");
            if (isBlank(req.getDepartment())) throw new IllegalArgumentException("부서는 필수입니다.");
        }
    }

    private void validateLoginRequest(LoginRequest req) {
        if (req.getRole() == null) throw new IllegalArgumentException("로그인 유형(role)은 필수입니다.");
        if (isBlank(req.getLoginId())) throw new IllegalArgumentException("아이디는 필수입니다.");
        if (isBlank(req.getPassword())) throw new IllegalArgumentException("비밀번호는 필수입니다.");
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
