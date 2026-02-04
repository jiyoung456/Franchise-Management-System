package com.franchise.backend.notification.job;

import com.franchise.backend.common.time.ServiceTime;
import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.repository.EventLogRepository;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.entity.NotificationGroup;
import com.franchise.backend.notification.entity.NotificationType;
import com.franchise.backend.notification.repository.NotificationGroupRepository;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.notification.service.NotificationSchedule;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NotificationReminderJob {

    private final NotificationGroupRepository groupRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final EventLogRepository eventLogRepository;

    /**
     * 매일 09:00 (Asia/Seoul)
     * - POS: 7일 재알림 / 14일 에스컬
     * - QSC: 3일 재알림 / 7일 에스컬
     * - OPS 등은 아예 제외
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    @Transactional
    public void run() {
        OffsetDateTime now = ServiceTime.nowOffset();

        // 1) OPEN 그룹만 대상
        List<NotificationGroup> openGroups = groupRepository.findByStatus("OPEN");

        for (NotificationGroup group : openGroups) {

            String issueType = group.getRule().getEventType();

            // ✅ POS/QSC만 처리
            if (!"POS".equals(issueType) && !"QSC".equals(issueType)) {
                continue;
            }

            // 2) 같은 날 중복 발송 방지
            if (group.getLastNotifiedAt() != null
                    && group.getLastNotifiedAt().toLocalDate().isEqual(now.toLocalDate())) {
                continue;
            }

            // ✅ 해당 그룹의 활성 이벤트(OPEN/ACK) 조회 (Notification.create에 null 넣으면 500 날 수 있음)
            EventLog event = eventLogRepository
                    .findActiveByStoreIdAndRuleId(group.getStore().getId(), group.getRule().getRuleId())
                    .orElse(null);

            // 그룹은 OPEN인데 이벤트가 없으면 데이터 불일치 → 스킵
            if (event == null) {
                continue;
            }

            long days = NotificationSchedule.persistedDays(group.getFirstOccurredAt(), now);
            int[] th = NotificationSchedule.thresholds(issueType);
            int remindDays = th[0];
            int escalationDays = th[1];

            // 3) 에스컬레이션 (SV + 팀장)
            if (days >= escalationDays && group.getEscalationStep() < 2) {

                // 3-1) SV에게 ESCALATION
                notificationRepository.save(Notification.create(
                        group,
                        event,
                        group.getUser(),
                        NotificationType.ESCALATION,
                        "[" + group.getStore().getStoreName() + "] " + group.getRule().getRuleName(),
                        "이벤트가 장기간 해결되지 않아 팀장에게 에스컬레이션되었습니다."
                ));


                // 3-2) 팀장(Manager) 찾기: SV의 department 기준
                User manager = userRepository
                        .findFirstByRoleAndDepartmentAndAccountStatusTrue(
                                Role.MANAGER,
                                group.getUser().getDepartment()
                        )
                        .orElse(null);

                if (manager != null) {

                    String managerDedupKey =
                            group.getStore().getId() + ":" + group.getRule().getRuleId() + ":" + manager.getId();

                    // 1) 먼저 조회
                    NotificationGroup managerGroup = groupRepository.findByDedupKey(managerDedupKey).orElse(null);

                    // 2) 없으면 생성해서 "먼저 저장" (동시성 경합 방어)
                    if (managerGroup == null) {
                        NotificationGroup toCreate = NotificationGroup.create(
                                managerDedupKey,
                                manager,
                                group.getStore(),
                                group.getRule(),
                                group.getFirstOccurredAt()
                        );
                        toCreate.markNotified(now);

                        try {
                            managerGroup = groupRepository.save(toCreate);
                        } catch (DataIntegrityViolationException e) {
                            // 다른 트랜잭션이 동시에 만들어서 uq(dedup_key) 충돌난 케이스
                            managerGroup = groupRepository.findByDedupKey(managerDedupKey)
                                    .orElseThrow(() -> e);
                        }
                    } else {
                        // 이미 있으면 notified만 갱신
                        managerGroup.markNotified(now);
                        managerGroup = groupRepository.save(managerGroup);
                    }

                    // 3) 이제 managerGroup은 영속 상태(=id 존재)라 Notification 저장 가능
                    notificationRepository.save(Notification.create(
                            managerGroup,
                            event,
                            manager,
                            NotificationType.ESCALATION,
                            "[" + group.getStore().getStoreName() + "] " + group.getRule().getRuleName(),
                            "담당 점포 이슈가 장기간 해결되지 않아 에스컬레이션되었습니다."
                    ));

                    managerGroup.markNotified(now);
                    groupRepository.save(managerGroup);
                }

                group.updateEscalationStep(2);
                group.markNotified(now);
                groupRepository.save(group);
                continue;
            }

            // 4) 재알림(SV) - 한번만
            if (days >= remindDays && group.getEscalationStep() < 1) {

                notificationRepository.save(Notification.create(
                        group,
                        event,
                        group.getUser(),
                        NotificationType.REMIND,
                        "[" + group.getStore().getStoreName() + "] " + group.getRule().getRuleName(),
                        "이벤트가 일정 기간 지속되고 있습니다. 확인이 필요합니다."
                ));

                group.updateEscalationStep(1);
                group.markNotified(now);
                groupRepository.save(group);
            }
        }
    }
}
