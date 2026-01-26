package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.ActionListResponse;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.repository.ActionRepository;
import org.springframework.stereotype.Service;
import com.franchise.backend.action.dto.ActionDetailResponse;
import com.franchise.backend.action.dto.ActionCreateRequest;
import org.springframework.transaction.annotation.Transactional;



import java.util.List;

@Service
public class LeaderActionService {

    private final ActionRepository actionRepository;

    public LeaderActionService(ActionRepository actionRepository) {
        this.actionRepository = actionRepository;
    }

    public List<ActionListResponse> getActionList() {
        List<Action> actions = actionRepository.findAllByOrderByPriorityAscDueDateAsc();

        return actions.stream()
                .map(a -> new ActionListResponse(
                        a.getId(),
                        a.getTitle(),
                        a.getStoreId(),
                        a.getPriority(),
                        a.getStatus(),
                        a.getDueDate(),
                        a.getAssignedToUserId()
                ))
                .toList();
    }

    public ActionDetailResponse getActionDetail(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("조치가 존재하지 않습니다. id=" + actionId));

        return new ActionDetailResponse(
                action.getId(),
                action.getStoreId(),
                action.getRelatedEventId(),
                action.getActionType(),
                action.getTitle(),
                action.getDescription(),
                action.getPriority(),
                action.getStatus(),
                action.getTargetMetricCode(),
                action.getDueDate(),
                action.getAssignedToUserId(),
                action.getCreatedByUserId(),
                action.getCreatedAt(),
                action.getUpdatedAt()
        );
    }

    @Transactional
    public Long createAction(ActionCreateRequest req, Long createdByUserId) {

        Action action = new Action(
                req.getStoreId(),
                req.getRelatedEventId(),
                req.getActionType(),
                req.getAssignedToUserId(),
                req.getTargetMetricCode(),
                req.getDueDate(),
                req.getPriority(),
                req.getTitle(),
                req.getDescription(),
                createdByUserId
        );

        Action saved = actionRepository.save(action);
        return saved.getId();
    }


}
