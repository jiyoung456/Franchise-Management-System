package com.franchise.backend.briefing.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface Qsc30dRepository extends JpaRepository<QscMaster, Long> {

    interface Qsc30dRow {
        Long getInspectionId();
        Long getStoreId();
        OffsetDateTime getConfirmedAt();
        Integer getTotalScore();
        String getSummaryComment();
    }

    // SV: 담당 점포 + 최근 30일 + CONFIRMED
    @Query("""
        select
            qm.inspectionId as inspectionId,
            qm.storeId as storeId,
            qm.confirmedAt as confirmedAt,
            qm.totalScore as totalScore,
            qm.summaryComment as summaryComment
        from QscMaster qm
        join Store s on s.id = qm.storeId
        where s.supervisor.id = :userId
          and qm.confirmedAt >= :fromDate
          and qm.status = 'CONFIRMED'
        order by qm.confirmedAt desc
    """)
    List<Qsc30dRow> findRecent30dBySupervisor(
            @Param("userId") Long userId,
            @Param("fromDate") OffsetDateTime fromDate
    );

    // 팀장: 지역 점포 + 최근 30일 + CONFIRMED
    @Query("""
        select
            qm.inspectionId as inspectionId,
            qm.storeId as storeId,
            qm.confirmedAt as confirmedAt,
            qm.totalScore as totalScore,
            qm.summaryComment as summaryComment
        from QscMaster qm
        join Store s on s.id = qm.storeId
        where s.regionCode = :regionCode
          and qm.confirmedAt >= :fromDate
          and qm.status = 'CONFIRMED'
        order by qm.confirmedAt desc
    """)
    List<Qsc30dRow> findRecent30dByRegion(
            @Param("regionCode") String regionCode,
            @Param("fromDate") OffsetDateTime fromDate
    );
}
