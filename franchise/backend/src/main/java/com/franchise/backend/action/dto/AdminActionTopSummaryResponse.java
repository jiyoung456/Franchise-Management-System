package com.franchise.backend.action.dto;

import java.time.LocalDate;

public record AdminActionTopSummaryResponse(

        long overdueCount,        // OVERDUE 조치 수

        Long actionId,             // 가장 긴급한 조치 ID
        String actionTitle,        // 조치 제목
        String storeName,          // 점포명
        LocalDate dueDate          // 기한
) {
}
