package com.franchise.backend.qsc.repository;

import java.time.OffsetDateTime;

public final class QscStoreStatusProjection {

    private QscStoreStatusProjection() {}

    public interface Row {
        Long getStoreId();
        String getStoreName();
        String getRegionCode();

        // 전체 기간 최신 CONFIRMED 1건
        String getLatestGrade();
        OffsetDateTime getLatestConfirmedAt();

        // 이번달 CONFIRMED 건수 (없으면 0)
        Long getThisMonthInspectionCount();
    }
}
