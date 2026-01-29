package com.franchise.backend.event.service;

import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.repository.UserRepository;
import com.franchise.backend.user.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventScopeService {

    private final UserRepository userRepository;
    private final StoreRepository storeRepository;

    /**
     * Role별 접근 가능한 storeIds 반환
     * - ADMIN: null (전체 범위)
     * - MANAGER: 본인 department와 같은 SV가 담당하는 점포들
     * - SUPERVISOR: 본인이 담당하는 점포들
     */
    public List<Long> resolveAccessibleStoreIds(UserPrincipal principal) {
        if (principal == null) return Collections.emptyList();

        Role role = principal.getRole(); // ✅ UserPrincipal에 getRole() 있어야 함
        String loginId = principal.getLoginId();

        if (role == null || loginId == null || loginId.isBlank()) {
            return Collections.emptyList();
        }

        // ADMIN: 전체 스코프 (null로 반환 -> 쿼리에서 필터 미적용)
        if (role == Role.ADMIN) {
            return null;
        }

        // SUPERVISOR: 본인 담당 점포
        if (role == Role.SUPERVISOR) {
            return storeRepository.findStoreIdsBySupervisorLoginId(loginId.trim());
        }

        // MANAGER: 본인 department 조회 -> 해당 department SV 점포들
        if (role == Role.MANAGER) {
            String department = userRepository.findByLoginId(loginId.trim())
                    .map(u -> u.getDepartment() == null ? null : u.getDepartment().trim())
                    .orElse(null);

            if (department == null || department.isBlank()) {
                return Collections.emptyList();
            }

            return storeRepository.findStoreIdsBySupervisorDepartment(department);
        }

        return Collections.emptyList();
    }
}
