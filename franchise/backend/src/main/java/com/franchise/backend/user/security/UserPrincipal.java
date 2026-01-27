package com.franchise.backend.user.security;

import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String loginId;
    private final Role role;
    private final String password; // security 필요(로그인 시 사용)

    public UserPrincipal(Long userId, String loginId, Role role, String password) {
        this.userId = userId;
        this.loginId = loginId;
        this.role = role;
        this.password = password;
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getLoginId(),
                user.getRole(),
                user.getPassword()
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security는 보통 ROLE_ prefix를 사용
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return loginId;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
