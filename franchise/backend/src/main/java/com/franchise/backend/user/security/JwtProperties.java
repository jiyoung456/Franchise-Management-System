package com.franchise.backend.user.security;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    private String secret;
    private int accessTokenExpMinutes = 60;

    private Cookie cookie = new Cookie();

    @Getter
    @Setter
    public static class Cookie {
        private String name = "ACCESS_TOKEN";
        private boolean secure = false;
        private String sameSite = "Lax";
    }
}
