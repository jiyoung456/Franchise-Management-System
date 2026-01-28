package com.franchise.backend.action.dto;

import java.time.LocalDate;
import java.util.List;

public record ActionResultFormResponse(
        Long actionId,

        LocalDate performedDate,
        String storeName,

        String issueReason,
        String actionTitle,
        String actionType,

        String resultComment,

        List<AttachmentResponse> attachments
) {
    public record AttachmentResponse(
            Long attachmentId,
            String photoUrl,
            String photoName
    ) {}
}
