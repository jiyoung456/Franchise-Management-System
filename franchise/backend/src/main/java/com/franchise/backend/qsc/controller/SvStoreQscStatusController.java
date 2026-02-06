package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.storestatus.SvStoreQscStatusResponse;
import com.franchise.backend.qsc.service.SvStoreQscStatusService;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sv/qsc/stores")
public class SvStoreQscStatusController {

    private final SvStoreQscStatusService svStoreQscStatusService;

    @GetMapping("/status")
    public SvStoreQscStatusResponse status(
            @RequestParam String month,
            @RequestParam(required = false) String keyword
    ) {
        Long svId = getCurrentSupervisorId();
        return svStoreQscStatusService.getStoreQscStatus(svId, month, keyword);
    }

    private Long getCurrentSupervisorId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated");
        }

        Object principal = auth.getPrincipal();

        // principal이 UserPrincipal이면 userId를 svId로 사용
        if (principal instanceof UserPrincipal p) {
            return p.getUserId();
        }

        // anonymousUser 같은 케이스 방어
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Unsupported principal type: " + principal.getClass().getName()
        );
    }
}
