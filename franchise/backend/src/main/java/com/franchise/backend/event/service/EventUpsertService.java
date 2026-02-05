package com.franchise.backend.event.service;

import com.franchise.backend.notification.repository.NotificationGroupRepository;
import com.franchise.backend.notification.entity.NotificationGroup;
import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.notification.service.NotificationCreateService;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.entity.NotificationType;
import com.franchise.backend.notification.service.NotificationSchedule;
import com.franchise.backend.user.entity.Role;


import java.time.OffsetDateTime;
import com.franchise.backend.event.entity.EventLog;

@Service
@RequiredArgsConstructor
public class EventUpsertService {

    private final EventLogRepository eventLogRepository;
    private final NotificationCreateService notificationCreateService;
    private final NotificationGroupRepository notificationGroupRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;



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
            existing.accumulateOccurrence(occurredAt);
            if (supervisor != null) {
                String dedupKey = storeId + ":" + ruleId + ":" + supervisor.getId();

                NotificationGroup group = notificationGroupRepository.findByDedupKey(dedupKey)
                        .orElseGet(() -> NotificationGroup.create(
                                dedupKey,
                                supervisor,
                                store,
                                rule,
                                occurredAt
                        ));

                group.accumulateOccurrence(occurredAt);
                // ✅ 지속일 계산은 "이번 발생시각(occurredAt)" 기준으로
                OffsetDateTime now = occurredAt;

                long days = NotificationSchedule.persistedDays(group.getFirstOccurredAt(), now);

                int[] th = NotificationSchedule.thresholds(rule.getEventType());
                int remindDays = th[0];
                int escalationDays = th[1];

// 링크(이미 컨트롤러가 /api/events/{eventId} 임)
                String body = buildBody(existing, occurredAt);

// ---- 1차 재알림 ----
                if (days >= remindDays && group.getEscalationStep() == 0) {

                    Notification remind = Notification.create(
                            group,
                            existing,
                            supervisor,
                            NotificationType.REMIND,
                            "[" + store.getStoreName() + "] 지속 발생",
                            body
                    );

                    notificationRepository.save(remind);
                    group.updateEscalationStep(1);
                    group.markNotified(now);
                }

// ---- 팀장 에스컬레이션 ----
                if (days >= escalationDays && group.getEscalationStep() < 2) {

                    // SV에게도 알림
                    Notification escSv = Notification.create(
                            group,
                            existing,
                            supervisor,
                            NotificationType.ESCALATION,
                            "[" + store.getStoreName() + "] 장기 미해결",
                            body
                    );
                    notificationRepository.save(escSv);

                    // 팀장 조회: department 당 1명
                    User manager = userRepository
                            .findFirstByRoleAndDepartmentAndAccountStatusTrue(
                                    Role.MANAGER,
                                    supervisor.getDepartment()
                            )
                            .orElse(null);

                    if (manager != null) {
                        String managerKey = storeId + ":" + ruleId + ":" + manager.getId();

                        NotificationGroup managerGroup = notificationGroupRepository.findByDedupKey(managerKey)
                                .orElseGet(() -> NotificationGroup.create(
                                        managerKey,
                                        manager,
                                        store,
                                        rule,
                                        occurredAt
                                ));

                        managerGroup.accumulateOccurrence(occurredAt);
                        notificationGroupRepository.save(managerGroup);

                        Notification escManager = Notification.create(
                                managerGroup,
                                existing,
                                manager,
                                NotificationType.ESCALATION,
                                "[" + store.getStoreName() + "] 팀장 에스컬",
                                body
                        );

                        notificationRepository.save(escManager);
                    }

                    group.updateEscalationStep(2);
                    group.markNotified(now);
                }

                notificationGroupRepository.save(group);

            }

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

    private String buildBody(EventLog event, OffsetDateTime occurredAt) {
        String link = "/api/events/" + event.getEventId();
        return ""
                + "요약: " + event.getSummary() + "\n"
                + "발생시각: " + occurredAt + "\n"
                + "상세보기: " + link;
    }

}
