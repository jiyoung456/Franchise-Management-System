package com.franchise.backend.notification.job;

import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.entity.NotificationGroup;
import com.franchise.backend.notification.entity.NotificationType;
import com.franchise.backend.notification.repository.NotificationGroupRepository;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.notification.service.NotificationSchedule;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.entity.User;
import com.franchise.backend.user.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class NotificationReminderJob {

    private final NotificationGroupRepository groupRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationReminderJob(
            NotificationGroupRepository groupRepository,
            NotificationRepository notificationRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * 매일 오전 9시 실행
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void run() {
        OffsetDateTime now = OffsetDateTime.now();

        // 1) OPEN 상태 그룹만 조회
        List<NotificationGroup> groups = groupRepository.findAll().stream()
                .filter(g -> "OPEN".equals(g.getStatus()))
                .toList();

        for (NotificationGroup group : groups) {

            long days = NotificationSchedule.persistedDays(
                    group.getFirstOccurredAt(), now
            );

            int[] thresholds = NotificationSchedule.thresholds(
                    group.getRule().getEventType()
            );

            int remindDays = thresholds[0];
            int escalationDays = thresholds[1];

            // 2) 이미 오늘 알림 보냈으면 스킵
            if (group.getLastNotifiedAt() != null &&
                    group.getLastNotifiedAt().toLocalDate()
                            .isEqual(now.toLocalDate())) {
                continue;
            }

            // 3) 에스컬레이션 (MANAGER)
            if (days >= escalationDays && group.getEscalationStep() < 2) {

                User manager = userRepository
                        .findFirstByRoleAndDepartmentAndAccountStatusTrue(
                                Role.MANAGER,
                                group.getUser().getDepartment()
                        )
                        .orElse(null);

                if (manager != null) {
                    Notification n = Notification.create(
                            group,
                            null,
                            manager,
                            NotificationType.ESCALATION,
                            "[" + group.getStore().getStoreName() + "] "
                                    + group.getRule().getRuleName(),
                            "이벤트가 장기간 해결되지 않아 팀장 에스컬레이션되었습니다."
                    );
                    notificationRepository.save(n);
                }

                group.updateEscalationStep(2);
                group.markNotified(now);
                continue;
            }

            // 4) 재알림 (SV)
            if (days >= remindDays && group.getEscalationStep() < 1) {

                Notification n = Notification.create(
                        group,
                        null,
                        group.getUser(),
                        NotificationType.REMIND,
                        "[" + group.getStore().getStoreName() + "] "
                                + group.getRule().getRuleName(),
                        "이벤트가 일정 기간 지속되고 있습니다. 확인이 필요합니다."
                );

                notificationRepository.save(n);
                group.updateEscalationStep(1);
                group.markNotified(now);
            }
        }
    }
}
