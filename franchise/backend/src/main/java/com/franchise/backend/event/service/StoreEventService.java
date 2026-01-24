package com.franchise.backend.event.service;

import com.franchise.backend.event.dto.StoreEventResponse;
import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.repository.EventLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreEventService {

    private final EventLogRepository eventLogRepository;

    // 점포 상세 - 이벤트 목록 최신순
    @Transactional(readOnly = true)
    public List<StoreEventResponse> getStoreEvents(Long storeId, int limit) {

        int safeLimit = Math.max(1, Math.min(limit, 100));

        List<EventLog> events =
                eventLogRepository.findByStoreIdOrderByOccurredAtDesc(
                        storeId,
                        PageRequest.of(0, safeLimit)
                );

        return events.stream()
                .map(e -> new StoreEventResponse(
                        e.getEventId(),          // ✅ 여기!
                        e.getRuleId(),
                        e.getStoreId(),
                        e.getEventType(),
                        e.getSeverity(),
                        e.getStatus(),
                        e.getSummary(),
                        e.getOccurredAt(),
                        e.getRelatedEntityType(),
                        e.getRelatedEntityId(),
                        e.getOccurrenceCount(),
                        e.getLastNotifiedAt(),
                        e.getAssignedToUserId()
                ))
                .toList();
    }
}
