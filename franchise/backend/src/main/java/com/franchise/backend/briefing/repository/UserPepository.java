package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.dto.UserInfoDto;
import com.franchise.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserPepository extends JpaRepository<User, Long> {

    //=====================
    // 1. 유저 정보 조회
    //=====================
    @Query("""
        select new com.franchise.backend.briefing.dto.UserInfoDto(
            u.id,
            u.role,
            u.department
        )
        from User u
            where u.loginId = :loginId
        """)
    Optional<UserInfoDto> findUserIdByLoginId(@Param("loginId") String loginId);

}
