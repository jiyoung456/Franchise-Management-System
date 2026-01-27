package com.franchise.backend.user.service;

import com.franchise.backend.user.dto.AuthUserResponse;
import com.franchise.backend.user.dto.SignupRequest;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserAuthService {

    private final UserRepository userRepository;

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

        // ADMIN 기본값 보정 (원하면 여기서 강제 규칙 적용 가능)
        String region = req.getRegion();
        String department = req.getDepartment();

        if (req.getRole() == Role.ADMIN) {
            // 네 SQL 정책: ADMIN department='운영본부', region='ALL'
            if (department == null || department.isBlank()) department = "운영본부";
            if (region == null || region.isBlank()) region = "ALL";
        }

        User user = User.create(
                req.getUserName(),
                req.getRole(),
                req.getLoginId(),
                req.getPassword(),     // 현재는 seed 데이터(1234)와 호환 위해 평문. (나중에 암호화 붙일 수 있음)
                department,
                req.getEmail(),
                region
        );

        User saved = userRepository.save(user);
        return saved.getId();
    }

    @Transactional
    public AuthUserResponse login(String loginId, String password) {
        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (Boolean.FALSE.equals(user.getAccountStatus())) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        // 현재는 평문 비교 (seed 1234와 호환)
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
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

        // SV/팀장은 화면상 region/department 입력 받으므로 필수로 강제
        if (req.getRole() == Role.SUPERVISOR || req.getRole() == Role.MANAGER) {
            if (isBlank(req.getRegion())) throw new IllegalArgumentException("담당 지역은 필수입니다.");
            if (isBlank(req.getDepartment())) throw new IllegalArgumentException("부서는 필수입니다.");
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
