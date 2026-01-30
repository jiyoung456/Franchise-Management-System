package com.franchise.backend.action.repository;

import com.franchise.backend.action.entity.ActionAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActionAttachmentRepository extends JpaRepository<ActionAttachment, Long> {
    List<ActionAttachment> findAllByActionResult_IdOrderByCreatedAtAsc(Long actionResultId);
}
