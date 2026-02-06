package com.franchise.backend.agentApiConfig.fastApiClient;

import com.franchise.backend.agentApiConfig.webClientConfig.WebClientConfig;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class FastApiClient {

    // ======================================================
    // 외부 에이전트 FAST API와 통신하기 위한 post 메서드 정의
    // ======================================================

    private final WebClient webClient;

    public FastApiClient(WebClient fastApiWebClient) {
        this.webClient = fastApiWebClient;
    }

    public <T, R> R post(
            String endpoint,
            T requestBody,
            Class<R> responseType
    ) {
        return webClient.post()
                .uri(endpoint)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(responseType)
                .block();
    }
}
