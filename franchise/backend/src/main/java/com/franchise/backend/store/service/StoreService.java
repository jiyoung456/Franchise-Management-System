package com.franchise.backend.store.service;

import com.franchise.backend.store.dto.StoreDetailResponse;
import com.franchise.backend.store.dto.StoreUpdateRequest;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import com.franchise.backend.store.repository.StoreRepository;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;

    // 점포 상세(가게 정보 탭 포함)
    @Transactional(readOnly = true)
    public StoreDetailResponse getStoreDetail(Long storeId) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다. storeId=" + storeId));

        return toDetailResponse(store);
    }

    // 점포 정보 수정
    // - 임의값 넣지 않음: request에 없는 값은 DB 값 그대로 유지
    // - 구현 못한 항목은 null/0 정책 유지 (여기서는 건드리지 않음)
    @Transactional
    public StoreDetailResponse updateStore(Long storeId, StoreUpdateRequest request) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다. storeId=" + storeId));

        if (request == null) {
            // 아무 것도 수정 안 함
            return getStoreDetail(storeId);
        }

        // 1) 운영 상태 (OPEN/CLOSED)
        if (request.getStoreOperationStatus() != null) {
            String status = request.getStoreOperationStatus().trim().toUpperCase();
            if (!status.equals("OPEN") && !status.equals("CLOSED")) {
                throw new IllegalArgumentException("storeOperationStatus는 OPEN 또는 CLOSED만 허용됩니다.");
            }
            store.changeOperationStatus(status);
        }

        // 2) 점포명
        if (request.getStoreName() != null) {
            String name = request.getStoreName().trim();
            if (name.isBlank()) {
                throw new IllegalArgumentException("storeName은 비어 있을 수 없습니다.");
            }
            store.changeStoreName(name);
        }

        // 3) 점주명/연락처
        // - 둘 중 하나라도 들어오면, 들어온 값만 업데이트 / 나머지는 기존 값 유지
        if (request.getOwnerName() != null || request.getOwnerPhone() != null) {
            String ownerName = (request.getOwnerName() != null)
                    ? request.getOwnerName().trim()
                    : store.getOwnerName();

            String ownerPhone = (request.getOwnerPhone() != null)
                    ? request.getOwnerPhone().trim()
                    : store.getOwnerPhone();

            store.changeOwnerInfo(ownerName, ownerPhone);
        }

        // 4) 담당 SV (users.login_id로 매핑)
        // - null이면 유지
        // - 빈 문자열이면 미지정(null)로 변경
        if (request.getSupervisorLoginId() != null) {
            String loginId = request.getSupervisorLoginId().trim();

            if (loginId.isBlank()) {
                store.changeSupervisor(null);
            } else {
                User supervisor = userRepository.findByLoginId(loginId)
                        .orElseThrow(() -> new IllegalArgumentException(
                                "해당 loginId의 사용자가 없습니다. supervisorLoginId=" + loginId
                        ));
                store.changeSupervisor(supervisor);
            }
        }

        // 5) 리스크 등급 수동 조정 (NORMAL/WATCHLIST/RISK)
        if (request.getCurrentState() != null) {
            String stateStr = request.getCurrentState().trim().toUpperCase();
            StoreState newState;
            try {
                newState = StoreState.valueOf(stateStr);
            } catch (Exception e) {
                throw new IllegalArgumentException("currentState는 NORMAL/WATCHLIST/RISK 중 하나여야 합니다.");
            }
            store.changeCurrentState(newState);
        }

        // updated_at 갱신
        store.touchUpdatedAt(LocalDateTime.now());

        // 저장
        Store saved = storeRepository.save(store);

        // 저장 후 최신 상세 반환
        return toDetailResponse(saved);
    }

    // 내부 변환 메서드
    private StoreDetailResponse toDetailResponse(Store store) {

        // supervisorLoginId: 요청대로 임의값 "-" 넣지 않고 null로 반환
        String supervisorLoginId = (store.getSupervisor() != null)
                ? store.getSupervisor().getLoginId()
                : null;

        LocalDate openedDate = (store.getOpenedAt() != null)
                ? store.getOpenedAt().toLocalDate()
                : null;

        // 상태변경이력 테이블이 없으므로 updated_at을 마지막 상태 변경일로 사용(현재 구현 범위)
        LocalDate lastStateChangedDate = (store.getUpdatedAt() != null)
                ? store.getUpdatedAt().toLocalDate()
                : null;

        return new StoreDetailResponse(
                store.getId(),
                store.getStoreName(),
                store.getRegionCode(),
                supervisorLoginId,

                store.getStoreOperationStatus(),
                (store.getCurrentState() != null ? store.getCurrentState().name() : null),
                store.getCurrentStateScore(), // ✅ 종합 위험 점수 = stores.current_state_score

                openedDate,
                lastStateChangedDate,

                store.getOwnerName(),
                store.getOwnerPhone(),

                store.getAddress(),

                store.getContractType(),
                store.getContractEndDate()
        );
    }
}
