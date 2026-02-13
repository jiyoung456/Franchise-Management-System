package com.franchise.backend.user.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 프론트 주소 (로컬)
        config.setAllowedOrigins(List.of("http://localhost:3000"));

        // 쿠키 포함 요청 허용
        config.setAllowCredentials(true);

        // 허용 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 허용 헤더
        config.setAllowedHeaders(List.of("*"));

        // 프론트에서 응답 헤더를 읽어야 한다면 노출 (Set-Cookie는 브라우저 JS로 읽기 제한이 있지만, 디버깅용)
        config.setExposedHeaders(List.of("Set-Cookie"));

        // 캐시 시간(초)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // 모든 API에 적용
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}
