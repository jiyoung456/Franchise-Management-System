package com.franchise.backend.user.repository;

import com.franchise.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByLoginId(String loginId);

    // 아이디 중복체크
    boolean existsByLoginId(String loginId);

    // 이메일 중복체크
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
