package com.franchise.backend.qsc.repository;

import java.time.OffsetDateTime;

public final class QscDashboardProjection {

    private QscDashboardProjection() {}

    public interface Summary {
        Double getAvgScore();
        Long getDoneCount();
        Long getRiskStoreCount();
        Long getSStoreCount();
    }

    public interface TrendRow {
        String getMonth();          // YYYY-MM
        Double getAvgScore();
        Long getInspectionCount();
    }

    public interface RankingRow {
        Long getStoreId();
        String getStoreName();
        Integer getScore();
        String getGrade();
        String getSummaryComment();
        OffsetDateTime getConfirmedAt();
    }
}
