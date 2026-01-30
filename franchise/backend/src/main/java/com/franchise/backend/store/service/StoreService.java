package com.franchise.backend.store.service;

import com.franchise.backend.pos.repository.PosDailyRepository;
import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscMasterRepository;
import com.franchise.backend.store.dto.StoreDetailResponse;
import com.franchise.backend.store.dto.StoreListResponse;
import com.franchise.backend.store.dto.StoreSearchRequest;
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
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final PosDailyRepository posDailyRepository;
    private final QscMasterRepository qscMasterRepository;

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

    // sv 점포 목록 (+ 필터 / 정렬 / 검색)
    @Transactional(readOnly = true)
    public List<StoreListResponse> getStoresForSupervisor(String supervisorLoginId, StoreSearchRequest condition) {

        String loginId = (supervisorLoginId == null ? null : supervisorLoginId.trim());
        if (loginId == null || loginId.isBlank()) {
            return List.of();
        }

        // 안전한 limit
        int safeLimit = normalizeLimit(condition != null ? condition.getLimit() : 50);

        StoreState state = (condition != null ? condition.getState() : null);
        String keyword = normalizeKeyword(condition != null ? condition.getKeyword() : null);

        // 1) DB에서 후보 점포 조회 (내 담당 + 상태 + 키워드)
        List<Store> stores = storeRepository.searchStoresForSupervisor(loginId, state, keyword);

        // 2) storeIds
        List<Long> storeIds = stores.stream().map(Store::getId).toList();

        // 3) 점포별 최신 COMPLETED QSC (점수/점검일)
        Map<Long, QscMaster> latestQscMap = storeIds.isEmpty()
                ? Map.of()
                : qscMasterRepository.findLatestCompletedByStoreIds(storeIds)
                .stream()
                .collect(Collectors.toMap(
                        QscMaster::getStoreId,
                        q -> q,
                        (a, b) -> {
                            if (a.getInspectedAt() == null) return b;
                            if (b.getInspectedAt() == null) return a;
                            return a.getInspectedAt().isAfter(b.getInspectedAt()) ? a : b;
                        }
                ));

        // 4) DTO 변환
        List<StoreListResponse> rows = stores.stream()
                .map(s -> {
                    QscMaster q = latestQscMap.get(s.getId());

                    Integer qscScore = (q != null ? q.getTotalScore() : 0);
                    LocalDate lastInspectionDate =
                            (q != null && q.getInspectedAt() != null)
                                    ? q.getInspectedAt().toLocalDate()
                                    : null;

                    // UI 지역: users.region(담당 SV 기준)을 우선 사용 (없으면 store.regionCode)
                    String regionDisplay = (s.getSupervisor() != null
                            && s.getSupervisor().getRegion() != null
                            && !s.getSupervisor().getRegion().isBlank())
                            ? s.getSupervisor().getRegion().trim()
                            : (s.getRegionCode() == null || s.getRegionCode().isBlank() ? "-" : s.getRegionCode());

                    // 담당 SV: 이름 우선, 없으면 loginId
                    String supervisorDisplay = "-";
                    if (s.getSupervisor() != null) {
                        String userName = s.getSupervisor().getUserName();
                        if (userName != null && !userName.isBlank()) {
                            supervisorDisplay = userName.trim();
                        } else {
                            String svLogin = s.getSupervisor().getLoginId();
                            supervisorDisplay = (svLogin == null || svLogin.isBlank()) ? "-" : svLogin;
                        }
                    }

                    return new StoreListResponse(
                            s.getId(),
                            s.getStoreName(),
                            s.getCurrentState().name(),
                            regionDisplay,
                            supervisorDisplay,
                            qscScore,
                            lastInspectionDate
                    );
                })
                .collect(Collectors.toList());

        // 5) 정렬
        StoreSort sort = normalizeSort(condition != null ? condition.getSort() : null);
        rows.sort(sort.getComparator());

        // 6) limit
        if (rows.size() > safeLimit) {
            return rows.subList(0, safeLimit);
        }
        return rows;
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

    // nomalize + sort
    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) return null;
        return keyword.trim();
    }

    private int normalizeLimit(Integer limit) {
        int v = (limit == null ? 50 : limit);
        return Math.max(1, Math.min(v, 200));
    }

    private StoreSort normalizeSort(String sort) {
        if (sort == null || sort.isBlank()) {
            // SV 화면 기본값이 "QSC 점수 높은순"이라면 이게 더 자연스러움
            return StoreSort.QSC_SCORE_DESC;
        }
        try {
            return StoreSort.valueOf(sort.trim().toUpperCase());
        } catch (Exception e) {
            return StoreSort.QSC_SCORE_DESC;
        }
    }

    private enum StoreSort {
        QSC_SCORE_DESC(Comparator
                .comparing(StoreListResponse::getQscScore, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed()
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        QSC_SCORE_ASC(Comparator
                .comparing(StoreListResponse::getQscScore, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        INSPECTED_AT_DESC(Comparator
                .comparing(StoreListResponse::getLastInspectionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .reversed()
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder()))),

        INSPECTED_AT_ASC(Comparator
                .comparing(StoreListResponse::getLastInspectionDate, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(StoreListResponse::getStoreName, Comparator.nullsLast(Comparator.naturalOrder())));

        private final Comparator<StoreListResponse> comparator;

        StoreSort(Comparator<StoreListResponse> comparator) {
            this.comparator = comparator;
        }

        public Comparator<StoreListResponse> getComparator() {
            return comparator;
        }
    }
}
