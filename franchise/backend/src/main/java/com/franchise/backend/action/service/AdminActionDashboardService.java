package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.AdminActionTopSummaryResponse;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminActionDashboardService {

    private final ActionRepository actionRepository;
    private final StoreRepository storeRepository;

    public AdminActionTopSummaryResponse getTopSummary() {

        // 기준일 고정
        LocalDate today = LocalDate.of(2025, 9, 1);

        List<String> statuses = List.of("OPEN", "IN_PROGRESS");

        // OVERDUE 조치 수
        long overdueCount = actionRepository
                .countByStatusInAndDueDateBefore(statuses, today);

        // 가장 긴급한 OVERDUE 조치 1건
        List<Action> urgentList =
                actionRepository.findMostUrgentOverdueAction(statuses, today);

        if (urgentList.isEmpty()) {
            return new AdminActionTopSummaryResponse(
                    overdueCount,
                    null,
                    null,
                    null,
                    null
            );
        }

        Action urgent = urgentList.get(0);

        String storeName = storeRepository.findById(urgent.getStoreId())
                .map(Store::getStoreName)
                .orElse("-");

        return new AdminActionTopSummaryResponse(
                overdueCount,
                urgent.getId(),
                urgent.getTitle(),
                storeName,
                urgent.getDueDate()
        );
    }
}
