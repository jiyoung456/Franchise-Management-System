package com.franchise.backend.action.service;

import com.franchise.backend.action.repository.ActionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActionSummaryService {

    private final ActionRepository actionRepository;

    public long countInProgressActions() {
        return actionRepository.countByStatusIn(
                List.of("OPEN", "IN_PROGRESS")
        );
    }
}
