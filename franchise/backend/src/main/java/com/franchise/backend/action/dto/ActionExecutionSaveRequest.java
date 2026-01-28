package com.franchise.backend.action.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ActionExecutionSaveRequest(
        LocalDateTime performedAt,
        String resultComment,
        List<AttachmentRequest> attachments,
        Long userId
) {
    public record AttachmentRequest(
            String photoUrl,
            String photoName
    ) {}
}
