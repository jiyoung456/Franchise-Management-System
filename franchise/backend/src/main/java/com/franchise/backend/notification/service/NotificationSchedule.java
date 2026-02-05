package com.franchise.backend.notification.service;

import com.franchise.backend.event.entity.EventLog;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

public class NotificationSchedule {

    /**
     * 이벤트 "지속 일수" 계산 (firstOccurredAt 기준)
     * - 0일: 당일
     * - 1일: 24시간 경과
     */
    public static long persistedDays(OffsetDateTime firstOccurredAt, OffsetDateTime now) {
        return ChronoUnit.DAYS.between(firstOccurredAt, now);
    }

    /**
     * eventType(룰 계열) 기준 재알림/에스컬 기준일 반환
     * - return[0] = remindDays
     * - return[1] = escalationDays
     *
     * POS: 7 / 14
     * QSC: 3 / 7
     * OPS(위험/복합): 5 / 10  (HIGH/CRITICAL 진입 전제는 다음 단계에서 체크)
     */
    public static int[] thresholds(String eventType) {
        if (eventType == null) return new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE};

        String t = eventType.trim().toUpperCase();

        if (t.contains("POS")) return new int[]{7, 14};
        if (t.contains("QSC")) return new int[]{3, 7};

        return new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE};
    }
}
