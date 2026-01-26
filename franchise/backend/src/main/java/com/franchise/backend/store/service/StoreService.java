package com.franchise.backend.store.service;

import com.franchise.backend.pos.repository.PosDailyRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final PosDailyRepository posDailyRepository;

    // 점포 상세(가게 정보 탭 포함)
    @Transactional(readOnly = true)
    public StoreDetailResponse getStoreDetail(Long storeId) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다. storeId=" + storeId));

        // 최근 7일 매출 계산
        LocalDate today = LocalDate.now();
        LocalDate from = today.minusDays(6);

        BigDecimal recent7dBd =
                posDailyRepository.sumSalesBetween(storeId, from, today);

        Long recent7dSales =
                (recent7dBd == null ? 0L : recent7dBd.longValue());

        return toDetailResponse(store, recent7dSales);
    }

    // 점포 정보 수정
    @Transactional
    public StoreDetailResponse updateStore(Long storeId, StoreUpdateRequest request) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 점포입니다. storeId=" + storeId));

        if (request == null) {
            return getStoreDetail(storeId);
        }

        if (request.getStoreOperationStatus() != null) {
            String status = request.getStoreOperationStatus().trim().toUpperCase();
            if (!status.equals("OPEN") && !status.equals("CLOSED")) {
                throw new IllegalArgumentException("storeOperationStatus는 OPEN 또는 CLOSED만 허용됩니다.");
            }
            store.changeOperationStatus(status);
        }

        if (request.getStoreName() != null) {
            String name = request.getStoreName().trim();
            if (name.isBlank()) {
                throw new IllegalArgumentException("storeName은 비어 있을 수 없습니다.");
            }
            store.changeStoreName(name);
        }

        if (request.getOwnerName() != null || request.getOwnerPhone() != null) {
            String ownerName = (request.getOwnerName() != null)
                    ? request.getOwnerName().trim()
                    : store.getOwnerName();

            String ownerPhone = (request.getOwnerPhone() != null)
                    ? request.getOwnerPhone().trim()
                    : store.getOwnerPhone();

            store.changeOwnerInfo(ownerName, ownerPhone);
        }

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

        store.touchUpdatedAt(LocalDateTime.now());

        storeRepository.save(store);

        return getStoreDetail(storeId);
    }

    // DTO 변환 (생성자 시그니처 정확히 맞춤)
    private StoreDetailResponse toDetailResponse(Store store, Long weeklyAvgSalesAmount) {

        String supervisorLoginId = (store.getSupervisor() != null)
                ? store.getSupervisor().getLoginId()
                : null;

        return new StoreDetailResponse(
                store.getId(),
                store.getStoreName(),
                store.getRegionCode(),
                supervisorLoginId,

                store.getStoreOperationStatus(),
                store.getCurrentState().name(),
                store.getCurrentStateScore(),

                null,                   // qscScore (아직 점포 상세에 안 쓰면 null)
                weeklyAvgSalesAmount,

                store.getOpenedAt() != null ? store.getOpenedAt().toLocalDate() : null,
                store.getUpdatedAt() != null ? store.getUpdatedAt().toLocalDate() : null,

                store.getOwnerName(),
                store.getOwnerPhone(),
                store.getAddress(),

                store.getContractType(),
                store.getContractEndDate()
        );
    }
}
