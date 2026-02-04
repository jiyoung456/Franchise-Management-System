package com.franchise.backend.common.time;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.time.OffsetDateTime;

@Configuration
public class ServiceClockConfig {

    @PostConstruct
    public void init() {
        // ✅ 서비스 기준일 고정 (KST)
        ServiceTime.useFixed(OffsetDateTime.parse("2025-08-31T00:00:00+09:00"));
    }
}
