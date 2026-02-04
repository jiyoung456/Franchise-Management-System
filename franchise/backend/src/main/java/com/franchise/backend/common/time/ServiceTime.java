package com.franchise.backend.common.time;

import java.time.*;
import java.util.Objects;
import java.util.function.Supplier;

public final class ServiceTime {

    private static volatile ZoneId ZONE = ZoneId.of("Asia/Seoul");
    private static volatile Supplier<OffsetDateTime> OFFSET_NOW_SUPPLIER =
            () -> OffsetDateTime.now(ZONE);
    private static volatile Supplier<LocalDateTime> LOCAL_NOW_SUPPLIER =
            () -> LocalDateTime.now(ZONE);

    private ServiceTime() {}

    public static OffsetDateTime nowOffset() {
        return OFFSET_NOW_SUPPLIER.get();
    }

    public static LocalDateTime nowLocal() {
        return LOCAL_NOW_SUPPLIER.get();
    }

    public static LocalDate today() {
        return nowLocal().toLocalDate();
    }

    public static ZoneId zone() {
        return ZONE;
    }

    /** 운영/테스트 기준시각 고정 */
    public static void useFixed(OffsetDateTime fixedNow) {
        Objects.requireNonNull(fixedNow, "fixedNow");
        ZONE = fixedNow.getOffset().equals(ZoneOffset.UTC) ? ZoneId.of("Asia/Seoul") : ZONE;

        OFFSET_NOW_SUPPLIER = () -> fixedNow;
        LOCAL_NOW_SUPPLIER = () -> fixedNow.atZoneSameInstant(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }

    /** 운영시간으로 되돌리기 */
    public static void useSystemClock() {
        ZONE = ZoneId.of("Asia/Seoul");
        OFFSET_NOW_SUPPLIER = () -> OffsetDateTime.now(ZONE);
        LOCAL_NOW_SUPPLIER = () -> LocalDateTime.now(ZONE);
    }
}
