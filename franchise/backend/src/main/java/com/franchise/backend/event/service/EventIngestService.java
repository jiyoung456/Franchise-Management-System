package com.franchise.backend.event.service;

import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.entity.NotificationGroup;
import com.franchise.backend.notification.entity.NotificationType;
import com.franchise.backend.notification.repository.NotificationGroupRepository;
import com.franchise.backend.notification.service.NotificationCreateService;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.franchise.backend.notification.service.NotificationSchedule;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.user.repository.UserRepository;


import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class EventIngestService {

    private final EventLogRepository eventLogRepository;
    private final NotificationCreateService notificationCreateService;
    private final NotificationGroupRepository notificationGroupRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;



    /**
     * "이벤트 1건 발생" 진입점
     * - Dedup: store_id + rule_id 기준으로 OPEN/ACK 존재하면 새 이벤트 생성 금지
     * - 없으면 새 EventLog 만들고 INITIAL 알림 생성
     */
    @Transactional
    public EventLog ingest(
            Store store,
            EventRule rule,
            OffsetDateTime occurredAt,
            String summary,
            String severity,
            User svReceiver
    ) {

        // 1) ACTIVE(OPEN/ACK) 이벤트가 있으면 -> 누적만 하고 끝 (알림 기본 미발송)
        EventLog active = eventLogRepository
                .findActiveByStoreIdAndRuleId(store.getId(), rule.getRuleId())
                .orElse(null);


        // 기존 active 이벤트가 있는 경우
        if (active != null) {

            active.accumulateOccurrence(occurredAt);

            if (svReceiver != null) {

                String dedupKey = store.getId() + ":" + rule.getRuleId() + ":" + svReceiver.getId();

                NotificationGroup group = notificationGroupRepository.findByDedupKey(dedupKey)
                        .orElseGet(() -> NotificationGroup.create(
                                dedupKey,
                                svReceiver,
                                store,
                                rule,
                                occurredAt
                        ));

                group.accumulateOccurrence(occurredAt);

                //재알림
                OffsetDateTime now = occurredAt;

                long days = NotificationSchedule.persistedDays(
                        group.getFirstOccurredAt(),
                        now
                );

                int[] th = NotificationSchedule.thresholds(rule.getEventType());
                int remindDays = th[0];
                int escalationDays = th[1];

                // ---- 1차 재알림 ----
                if (days >= remindDays && group.getEscalationStep() == 0) {

                    String link = "/api/events/" + active.getEventId();
                    String body = active.getSummary() + "\n상세보기: " + link;

                    Notification remind = Notification.create(
                            group,
                            active,
                            svReceiver,
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

                    String link = "/events/" + active.getEventId();
                    String body = active.getSummary() + "\n상세보기: " + link;

                    Notification escSv = Notification.create(
                            group,
                            active,
                            svReceiver,
                            NotificationType.ESCALATION,
                            "[" + store.getStoreName() + "] 장기 미해결",
                            body
                    );
                    notificationRepository.save(escSv);

                    // 팀장 찾기
                    User manager = userRepository
                            .findFirstByRoleAndDepartmentAndAccountStatusTrue(
                                    Role.MANAGER,
                                    svReceiver.getDepartment()
                            )
                            .orElse(null);

                    if (manager != null) {

                        String managerKey = store.getId() + ":" + rule.getRuleId() + ":" + manager.getId();

                        NotificationGroup managerGroup =
                                notificationGroupRepository.findByDedupKey(managerKey)
                                        .orElseGet(() -> NotificationGroup.create(
                                                managerKey,
                                                manager,
                                                store,
                                                rule,
                                                occurredAt
                                        ));

                        Notification escManager = Notification.create(
                                managerGroup,
                                active,
                                manager,
                                NotificationType.ESCALATION,
                                "[" + store.getStoreName() + "] 팀장 에스컬",
                                body
                        );

                        notificationGroupRepository.save(managerGroup);
                        notificationRepository.save(escManager);
                    }

                    group.updateEscalationStep(2);
                    group.markNotified(now);
                }

                notificationGroupRepository.save(group);
            }

            return active;
        }


        // 2) 없으면 새 EventLog 생성(OPEN) 후 저장
        EventLog created = EventLog.create(
                rule.getRuleId(),
                store.getId(),
                svReceiver != null ? svReceiver.getId() : null,
                rule.getEventType(),     // eventType
                severity,      // severity (없으면 occurredAt/summary 외부에서 받아서 넣는 구조로 바꿔야 함)
                summary,
                null,                    // relatedEntityType (없으면 파라미터로 받게 확장)
                null,                    // relatedEntityId   (없으면 파라미터로 받게 확장)
                occurredAt
        );

        EventLog saved = eventLogRepository.save(created);

        // 3) 최초 알림(INITIAL) 생성 (NotificationCreateService 내부에서 POS/QSC만 발송)
        if (svReceiver != null) {
            notificationCreateService.createInitialNotification(saved, rule, store, svReceiver);
        }

        return saved;
    }
}
