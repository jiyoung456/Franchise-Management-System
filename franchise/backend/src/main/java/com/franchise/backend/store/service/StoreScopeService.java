package com.franchise.backend.store.service;

import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreScopeService {

    private final StoreRepository storeRepository;

    /**
     * 로그인한 SV의 loginId 기준으로 담당 점포 ID 목록을 반환합니다.
     * 담당 점포가 없으면 빈 리스트를 반환합니다.
     */
    @Transactional(readOnly = true)
    public List<Long> getAccessibleStoreIdsByLoginId(String loginId) {
        if (loginId == null || loginId.isBlank()) {
            throw new IllegalArgumentException("loginId must not be blank");
        }
        return storeRepository.findStoreIdsBySupervisorLoginId(loginId);
    }
}
