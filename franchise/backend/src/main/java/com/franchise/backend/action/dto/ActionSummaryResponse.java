package com.franchise.backend.action.dto;

import java.time.LocalDate;

public record ActionSummaryResponse(
        Long actionId,
        String title,
        String status,
        LocalDate dueDate,
        Long assignedToUserId
) {}
