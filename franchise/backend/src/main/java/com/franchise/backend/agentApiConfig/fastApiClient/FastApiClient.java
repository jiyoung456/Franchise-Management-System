package com.franchise.backend.agentApiConfig.fastApiClient;

import com.franchise.backend.agentApiConfig.webClientConfig.WebClientConfig;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class FastApiClient {

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
