package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.ActionSummaryResponse;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.repository.ActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StoreActionQueryService {

    private final ActionRepository actionRepository;

    public List<ActionSummaryResponse> getActionsByStore(Long storeId) {
        return actionRepository.findByStoreIdOrderByDueDateAsc(storeId)
                .stream()
                .map(a -> new ActionSummaryResponse(
                        a.getId(),
                        a.getTitle(),
                        a.getStatus(),
                        a.getDueDate(),
                        a.getAssignedToUserId()
                ))
                .toList();
    }
}
