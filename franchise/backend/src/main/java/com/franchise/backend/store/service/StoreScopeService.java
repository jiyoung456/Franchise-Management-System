package com.franchise.backend.store.service;

import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreScopeService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * 로그인한 사용자가 접근 가능한 점포 ID 목록 반환
     *
     * - ADMIN       : 전체 점포
     * - SUPERVISOR  : 본인 담당 점포
     * - 그 외      : 빈 리스트
     */
    public List<Long> getAccessibleStoreIdsByLoginId(String loginId) {

        if (loginId == null || loginId.isBlank()) {
            throw new IllegalArgumentException("loginId must not be blank");
        }

        User user = userRepository.findByLoginId(loginId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + loginId));

        Role role = user.getRole();

        // ✅ ADMIN: 모든 점포
        if (role == Role.ADMIN) {
            return storeRepository.findAllStoreIds();
        }

        // ✅ SUPERVISOR: 본인 담당 점포
        if (role == Role.SUPERVISOR) {
            return storeRepository.findStoreIdsBySupervisorLoginId(loginId);
        }

        // 그 외 역할(MANAGER 등)
        return List.of();
    }
}
