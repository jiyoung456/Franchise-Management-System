package com.franchise.backend.user.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@EnableConfigurationProperties(JwtProperties.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
//조치 임시 테스트


//    @Bean
//    @Order(0) // ✅ 가장 먼저 적용
//    public SecurityFilterChain executionChain(HttpSecurity http) throws Exception {
//        http
//                .securityMatcher("/users/*/actions/summary") // ✅ 이 경로만 따로 잡기
//                .csrf(csrf -> csrf.disable())
//                .authorizeHttpRequests(auth -> auth
//                        .anyRequest().permitAll()
//                );
//
//        return http.build();
//    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // JWT면 세션 안 씀
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 개발 단계: CSRF 끔
                .csrf(csrf -> csrf.disable())

                // CORS (CorsConfig Bean 사용)
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // preflight 허용
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 인증 API는 공개
                        .requestMatchers(
                                "/api/auth/check-loginId",
                                "/api/auth/signup",
                                "/api/auth/login",
                                "/api/auth/logout"
                        ).permitAll()

                        // (선택) 로그인 상태 확인 API가 있다면 인증 필요
                        .requestMatchers("/api/auth/me").authenticated()

                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // DMIN 전용(설정/관리)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/templates/**").hasRole("ADMIN")
                        .requestMatchers("/api/qsc/templates/**").hasRole("ADMIN")
                        .requestMatchers("/api/rules/**").hasRole("ADMIN")
                        .requestMatchers("/api/event-rules/**").hasRole("ADMIN")
                        .requestMatchers("/api/risk/**").hasRole("ADMIN")
                        .requestMatchers("/api/risk-bands/**").hasRole("ADMIN")
                        .requestMatchers("/api/organizations/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")



                        // 공통 조회(Read) - 전 역할 허용 (데이터 레벨은 다음 단계)
                        .requestMatchers(HttpMethod.GET,
                                "/api/dashboard/**",
                                "/api/stores/**",
                                "/api/events/**",
                                "/api/actions/**",
                                "/api/qsc/**",
                                "/api/pos/**"
                        ).hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")

                        // Store Master - 등록/삭제는 ADMIN, 수정은 ADMIN/MANAGER
                        .requestMatchers(HttpMethod.POST, "/api/stores/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/stores/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/stores/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/stores/**").hasRole("ADMIN")

                        // (권장) 점포 상태 수동변경 전용 URL이 있으면 ADMIN만
                        .requestMatchers(HttpMethod.POST, "/api/stores/*/state").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/stores/*/state").hasRole("ADMIN")

                        // QSC - SV 수행 가능
                        .requestMatchers(HttpMethod.POST, "/api/qsc/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                        .requestMatchers(HttpMethod.PUT, "/api/qsc/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/qsc/**").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/qsc/**").hasRole("ADMIN")

                        // Events - 처리/변경은 MANAGER/ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/events/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/events/**").hasRole("ADMIN")

                        // Actions - 생성/변경은 MANAGER/ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/actions/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/actions/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/actions/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/actions/**").hasRole("ADMIN")

                        // 조치 수행 결과 입력(권장 경로)
                        .requestMatchers(HttpMethod.POST, "/api/actions/*/results").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")
                        .requestMatchers(HttpMethod.PATCH, "/api/actions/*/results").hasAnyRole("ADMIN", "MANAGER", "SUPERVISOR")

                        // POS - 수정 API가 있다면 MANAGER/ADMIN만
                        .requestMatchers(HttpMethod.POST, "/api/pos/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/pos/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PATCH, "/api/pos/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/pos/**").hasRole("ADMIN")

                        // 그 외는 인증 필요
                        .anyRequest().authenticated()

                )

                // JWT 필터
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
