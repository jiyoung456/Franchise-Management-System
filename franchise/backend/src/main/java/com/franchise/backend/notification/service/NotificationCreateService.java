package com.franchise.backend.notification.service;

import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.event.entity.EventRule;
import com.franchise.backend.notification.entity.Notification;
import com.franchise.backend.notification.entity.NotificationGroup;
import com.franchise.backend.notification.entity.NotificationType;
import com.franchise.backend.notification.repository.NotificationGroupRepository;
import com.franchise.backend.notification.repository.NotificationRepository;
import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class NotificationCreateService {

    private final NotificationGroupRepository groupRepository;
    private final NotificationRepository notificationRepository;

    public NotificationCreateService(
            NotificationGroupRepository groupRepository,
            NotificationRepository notificationRepository
    ) {
        this.groupRepository = groupRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * 최초 이벤트 발생 시 알림 생성
     */
    @Transactional
    public void createInitialNotification(
            EventLog event,
            EventRule rule,
            Store store,
            User receiver   // 최초는 SV
    ) {
        // ✅ POS / QSC만 알림 대상
        if (!"POS".equals(rule.getEventType()) && !"QSC".equals(rule.getEventType())) {
            return;
        }

        // 1) dedup key 생성 (정책 고정)
        String dedupKey = store.getId() + ":" + rule.getRuleId() + ":" + receiver.getId();

        // 2) NotificationGroup 조회 or 생성
        NotificationGroup group = groupRepository.findByDedupKey(dedupKey)
                .orElseGet(() ->
                        NotificationGroup.create(
                                dedupKey,
                                receiver,
                                store,
                                rule,
                                event.getOccurredAt()
                        )
                );

        // 3) 그룹 누적 정보 갱신
        group.accumulateOccurrence(event.getOccurredAt());

        // 4) Notification 생성
        Notification notification = Notification.create(
                group,
                event,
                receiver,
                NotificationType.INITIAL,
                "[" + store.getStoreName() + "] " + rule.getRuleName(),
                event.getSummary()
        );

        // 5) 저장
        groupRepository.save(group);
        notificationRepository.save(notification);

        // 6) 그룹 마지막 알림 시각 갱신
        group.markNotified(OffsetDateTime.now());
    }
}
