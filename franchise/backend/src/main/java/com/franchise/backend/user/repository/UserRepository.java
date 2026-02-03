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

    //지역별 sv 목록
    List<User> findByRoleAndRegionOrderByUserNameAsc(Role role, String region);
}
