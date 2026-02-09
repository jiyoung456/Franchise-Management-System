package com.franchise.backend.qsc.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.Base64;


@RestController
@RequestMapping("/api")
public class QscPhotoAnalyzeController {
    @Value("${openai.api.key}")
    private String apiKey;

    @PostMapping("/analyze-photo")
    public Map<String, String> analyze(@RequestParam("photo") MultipartFile photo) throws Exception {

        String base64 = Base64.getEncoder().encodeToString(photo.getBytes());
        String dataUrl = "data:image/jpeg;base64," + base64;

        Map<String, Object> body = Map.of(
                "model", "gpt-4.1",
                "input", List.of(
                        Map.of(
                                "role", "user",
                                "content", List.of(
                                        Map.of(
                                                "type", "input_text",
                                                "text", """
너는 프랜차이즈 위생 점검 전문가다.
사진을 보고 매장 상태를 분석하고
종합 의견을 한국어로 3줄 작성해라.
"""
                                        ),
                                        Map.of(
                                                "type", "input_image",
                                                "image_url", dataUrl
                                        )
                                )
                        )
                )
        );


        RestTemplate rest = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        ResponseEntity<Map> res = rest.postForEntity(
                "https://api.openai.com/v1/responses",
                req,
                Map.class
        );

        Map bodyRes = res.getBody();
        List output = (List) bodyRes.get("output");

        Map first = (Map) output.get(0);
        List content = (List) first.get("content");

        Map textObj = (Map) content.get(0);
        String result = (String) textObj.get("text");


        return Map.of("comment", result);
    }
}
