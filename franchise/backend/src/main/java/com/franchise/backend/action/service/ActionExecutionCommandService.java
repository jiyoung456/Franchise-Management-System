package com.franchise.backend.action.service;

import com.franchise.backend.action.dto.ActionExecutionSaveRequest;
import com.franchise.backend.action.entity.Action;
import com.franchise.backend.action.entity.ActionAttachment;
import com.franchise.backend.action.entity.ActionResult;
import com.franchise.backend.action.repository.ActionAttachmentRepository;
import com.franchise.backend.action.repository.ActionRepository;
import com.franchise.backend.action.repository.ActionResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ActionExecutionCommandService {

    private final ActionRepository actionRepository;
    private final ActionResultRepository actionResultRepository;
    private final ActionAttachmentRepository actionAttachmentRepository;

    public void saveExecutionAndClose(Long actionId, ActionExecutionSaveRequest req) {
        Action action = actionRepository.findById(actionId)
                .orElseThrow(() -> new IllegalArgumentException("Action not found. id=" + actionId));

        ActionResult actionResult = actionResultRepository.findByAction_Id(actionId).orElse(null);

        if (actionResult == null) {
            actionResult = new ActionResult(
                    action,
                    req.userId(),
                    req.performedAt(),
                    req.resultComment()
            );
            actionResultRepository.save(actionResult);
        } else {
            actionResult.update(req.performedAt(), req.resultComment());
        }

        // 첨부는 단순하게: 기존 삭제 후 다시 저장
        List<ActionAttachment> existing =
                actionAttachmentRepository.findAllByActionResult_IdOrderByCreatedAtAsc(actionResult.getId());
        if (!existing.isEmpty()) {
            actionAttachmentRepository.deleteAll(existing);
        }

        if (req.attachments() != null) {
            for (ActionExecutionSaveRequest.AttachmentRequest a : req.attachments()) {
                actionAttachmentRepository.save(
                        new ActionAttachment(actionResult, req.userId(), a.photoUrl(), a.photoName())
                );
            }
        }

        action.close();
    }
}
