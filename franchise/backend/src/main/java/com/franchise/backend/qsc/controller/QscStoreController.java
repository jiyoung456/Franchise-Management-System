
package com.franchise.backend.qsc.controller;

import com.franchise.backend.qsc.dto.QscStoreSearchResponse;
import com.franchise.backend.qsc.service.QscStoreQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/qsc/stores")
public class QscStoreController {

    private final QscStoreQueryService qscStoreQueryService;

    @GetMapping("/me")
    public List<QscStoreSearchResponse> getMyStores(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return qscStoreQueryService.getStoresForSupervisorLoginId( userDetails.getUsername());
    }

    //sv 권한 오류 계속 발생해서
    //임시로 해당 sv 매장 불러올 수 있는지 테스트하는 용도
    @GetMapping("/test/{supervisorId}")
    public List<QscStoreSearchResponse> testStores(@PathVariable Long supervisorId) {
        return qscStoreQueryService.getStoresForSupervisor(supervisorId);
    }

}
