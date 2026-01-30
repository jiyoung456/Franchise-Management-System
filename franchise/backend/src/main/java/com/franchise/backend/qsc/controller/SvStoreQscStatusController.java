package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.storestatus.SvStoreQscStatusResponse;
import com.franchise.backend.qsc.service.SvStoreQscStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sv/qsc/stores")
public class SvStoreQscStatusController {

    private final SvStoreQscStatusService svStoreQscStatusService;

    /**
     * 내 담당 점포 QSC 현황
     * GET /api/sv/qsc/stores/status?month=2025-01&keyword=강남
     */
    @GetMapping("/status")
    public SvStoreQscStatusResponse status(
            @RequestParam String month,
            @RequestParam(required = false) String keyword
    ) {
        Long svId = getCurrentSupervisorId();
        return svStoreQscStatusService.getStoreQscStatus(svId, month, keyword);
    }

    private Long getCurrentSupervisorId() {
        // TODO 프로젝트의 인증 principal에서 userId를 추출하도록 연결
        throw new IllegalStateException("SupervisorId resolver not implemented");
    }
}
