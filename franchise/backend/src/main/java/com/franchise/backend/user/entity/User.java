package com.franchise.backend.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "users")
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "user_name", nullable = false, length = 100)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private Role role;

    @Column(name = "login_id", nullable = false, length = 100)
    private String loginId;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "department", length = 100)
    private String department;

    @Column(name = "email", unique = true, length = 255)
    private String email;

    @Column(name = "account_status", nullable = false)
    private Boolean accountStatus;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "region", length = 50)
    private String region;


    // 생성용 팩토리
    public static User create(
            String userName,
            Role role,
            String loginId,
            String password,
            String department,
            String email,
            String region
    ) {
        User u = new User();
        u.userName = userName;
        u.role = role;
        u.loginId = loginId;
        u.password = password;
        u.department = department;
        u.email = email;
        u.region = region;
        u.accountStatus = true; // 기본 활성
        return u;
    }

    public void markLoginSuccess(LocalDateTime now) {
        this.lastLoginAt = now;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = com.franchise.backend.common.time.ServiceTime.nowLocal();
        this.createdAt = now;
        this.updatedAt = now;

        if (this.accountStatus == null) {
            this.accountStatus = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
