package com.franchise.backend.qsc.repository;

import java.time.Instant;
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

    // (추가) ADMIN SUMMARY
    public interface AdminSummary {
        Double getAvgScore();          // 월 전체 점검 점수 평균
        Long getDoneCount();           // 월 점검 건수
        Long getFailedStoreCount();    // (월 최신점검 기준) C/D 점포 수
        Long getGradeS();
        Long getGradeA();
        Long getGradeB();
        Long getGradeC();
        Long getGradeD();
    }

    // (추가) ADMIN LIST ROW
    public interface AdminListRow {
        Long getStoreId();
        String getStoreName();
        String getRegionCode();
        String getSupervisorName();
        Instant getInspectedAt();
        Integer getTotalScore();
        String getGrade();
        Boolean getIsPassed();
    }
}
