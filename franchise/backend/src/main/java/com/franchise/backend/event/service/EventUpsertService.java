package com.franchise.backend.event.service;

import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.notification.service.NotificationCreateService;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class EventUpsertService {

    private final EventLogRepository eventLogRepository;
    private final NotificationCreateService notificationCreateService;

    /**
     * REQ-EVT-03 트리거 평가 결과로 EventLog upsert (Dedup: store_id + rule_id)
     *
     * - 기존 OPEN/ACK 있으면:
     *   * 새 이벤트 생성 X
     *   * last_occurrence_at, occurrence_count 누적
     *   * 알림 추가 발송 X
     *
     * - 없으면:
     *   * 신규 event_log 생성(status=OPEN)
     *   * 최초 알림(SV) 생성 (POS/QSC만; OPS는 NotificationCreateService에서 early return)
     */
    @Transactional
    public UpsertResult upsertEventAndNotifyIfNew(
            Store store,
            EventRule rule,
            User supervisor,          // store.getSupervisor() 넘겨주면 됨
            String eventType,         // 예: POS_SALES_DROP
            String severity,          // INFO/WARNING/CRITICAL
            String summary,
            String relatedEntityType, // nullable
            Long relatedEntityId,     // nullable
            OffsetDateTime occurredAt
    ) {
        Long storeId = store.getId();
        Long ruleId = rule.getRuleId();

        // 1) Dedup: OPEN/ACK 기존 이벤트 조회
        EventLog existing = eventLogRepository.findActiveByStoreIdAndRuleId(storeId, ruleId)
                .orElse(null);

        if (existing != null) {
            // 2) 기존 이벤트 누적 (알림 추가 발송 X)
            existing.accumulate(occurredAt);
            return UpsertResult.updated(existing.getEventId());
        }

        // 3) 신규 이벤트 생성
        Long assignedToUserId = (supervisor == null ? null : supervisor.getId());

        EventLog created = EventLog.create(
                ruleId,
                storeId,
                assignedToUserId,
                eventType,
                severity,
                summary,
                relatedEntityType,
                relatedEntityId,
                occurredAt
        );

        EventLog saved = eventLogRepository.save(created);

        // 4) 최초 알림 (신규일 때만)
        if (supervisor != null) {
            notificationCreateService.createInitialNotification(
                    saved,
                    rule,
                    store,
                    supervisor
            );
        }

        return UpsertResult.inserted(saved.getEventId());
    }

    public record UpsertResult(boolean inserted, Long eventId) {
        public static UpsertResult inserted(Long eventId) {
            return new UpsertResult(true, eventId);
        }

        public static UpsertResult updated(Long eventId) {
            return new UpsertResult(false, eventId);
        }
    }
}
