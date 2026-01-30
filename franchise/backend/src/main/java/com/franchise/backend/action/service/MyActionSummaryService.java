package com.franchise.backend.action.service;

import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MyActionSummaryService {

    private final StoreRepository storeRepository;
    private final ActionRepository actionRepository;

    public long countMyInProgressActions(Long supervisorId) {
        List<Long> storeIds = storeRepository.findBySupervisor_Id(supervisorId)
                .stream()
                .map(Store::getId)
                .toList();

        if (storeIds.isEmpty()) return 0;

        return actionRepository.countByStoreIdInAndStatusIn(
                storeIds,
                List.of("OPEN", "IN_PROGRESS")
        );
    }
}
