package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.ActionResultFormResponse;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.entity.ActionAttachment;
import com.franchise.backend.action.entity.ActionResult;
import com.franchise.backend.action.repository.ActionAttachmentRepository;
import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.action.repository.ActionResultRepository;
import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.repository.EventLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.repository.StoreRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.time.Clock;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ActionResultFormService {

    private final ActionRepository actionRepository;
    private final ActionResultRepository actionResultRepository;
    private final ActionAttachmentRepository actionAttachmentRepository;
    private final EventLogRepository eventLogRepository;
    private final StoreRepository storeRepository;

    public ActionResultFormResponse getForm(Long actionId) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found. id=" + actionId));

        // EventLog.summary 가져오기 (relatedEventId nullable 방어)
        String issueReason = null;
        if (action.getRelatedEventId() != null) {
            EventLog eventLog = eventLogRepository.findById(action.getRelatedEventId())
                    .orElseThrow(() -> new IllegalArgumentException("EventLog not found. id=" + action.getRelatedEventId()));
            issueReason = eventLog.getSummary() + " (이벤트 #" + eventLog.getEventId() + ")";
        }

        // ActionResult는 없을 수도 있음
        ActionResult actionResult = actionResultRepository.findByAction_Id(actionId).orElse(null);

        LocalDate performedDate = null;
        String resultComment = null;
        List<ActionResultFormResponse.AttachmentResponse> attachments = Collections.emptyList();

        if (actionResult != null) {
            performedDate = actionResult.getPerformedAt() != null
                    ? actionResult.getPerformedAt().toLocalDate()
                    : null;

            resultComment = actionResult.getResultComment();

            List<ActionAttachment> found = actionAttachmentRepository
                    .findAllByActionResult_IdOrderByCreatedAtAsc(actionResult.getId());

            attachments = found.stream()
                    .map(a -> new ActionResultFormResponse.AttachmentResponse(
                            a.getId(),
                            a.getPhotoUrl(),
                            a.getPhotoName()
                    ))
                    .toList();
        }


        Store store = storeRepository.findById(action.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Store not found. id=" + action.getStoreId()));
        String storeName = store.getStoreName();

        return new ActionResultFormResponse(
                action.getId(),
                performedDate,
                storeName,
                issueReason,
                action.getTitle(),      // 수행 조치
                action.getActionType(), // 조치 유형
                resultComment,
                attachments
        );
    }
}
