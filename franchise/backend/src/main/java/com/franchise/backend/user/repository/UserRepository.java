package com.franchise.backend.user.repository;

import com.franchise.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import com.franchise.backend.user.entity.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLoginId(String loginId);

    // 아이디 중복체크
    boolean existsByLoginId(String loginId);

    // 이메일 중복체크
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    // ===================== 알림 / 에스컬레이션 =====================



    // 지역별 SV 조회 (기존)
    List<User> findByRoleAndRegionOrderByUserNameAsc(Role role, String region);

    // SV의 팀장(MANAGER) 조회
    // 정책: department 당 MANAGER는 1명
    Optional<User> findFirstByRoleAndDepartmentAndAccountStatusTrue(
            Role role,
            String department
    );




}
