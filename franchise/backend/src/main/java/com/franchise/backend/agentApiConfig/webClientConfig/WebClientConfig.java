package com.franchise.backend.agentApiConfig.webClientConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import org.springframework.web.reactive.function.client.WebClient;


@Configuration
public class WebClientConfig {

    // ======================================================
    // 외부 에이전트 FAST API와 통신하기 위한 webClient 모듈 빈 객체 생성
    // ======================================================

    @Bean
    public WebClient fastApiWebClient(
            @Value("${fastapi.base-url}") String baseUrl
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}
