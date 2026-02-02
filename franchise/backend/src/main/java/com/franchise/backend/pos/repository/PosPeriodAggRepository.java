package com.franchise.backend.pos.repository;

import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PosPeriodAggRepository extends JpaRepository<PosPeriodAgg, Long> {

    /**
     * 이번 기간 집계 조회 (SV 담당 점포들)
     */
    @Query("""
        select p
        from PosPeriodAgg p
        where p.periodType = :periodType
          and p.periodStart = :periodStart
          and p.storeId in :storeIds
    """)
    List<PosPeriodAgg> findByStoreIdsAndPeriod(
            @Param("storeIds") List<Long> storeIds,
            @Param("periodType") PosPeriodType periodType,
            @Param("periodStart") LocalDate periodStart
    );

    /**
     * 전기간 집계 조회 (성장률 계산용)
     * - 호출하는 쪽에서 prevPeriodStart를 계산해서 넣어주면 됨
     */
    @Query("""
        select p
        from PosPeriodAgg p
        where p.periodType = :periodType
          and p.periodStart = :prevPeriodStart
          and p.storeId in :storeIds
    """)
    List<PosPeriodAgg> findPrevByStoreIdsAndPeriod(
            @Param("storeIds") List<Long> storeIds,
            @Param("periodType") PosPeriodType periodType,
            @Param("prevPeriodStart") LocalDate prevPeriodStart
    );

    @Query("""
        select p
        from PosPeriodAgg p
        where p.storeId = :storeId
          and p.periodType = :periodType
          and p.periodStart = :periodStart
    """)
    Optional<PosPeriodAgg> findOne(
            @Param("storeId") Long storeId,
            @Param("periodType") PosPeriodType periodType,
            @Param("periodStart") LocalDate periodStart
    );

    @Query("""
        select p
        from PosPeriodAgg p
        where p.storeId = :storeId
          and p.periodType = :periodType
          and p.periodStart <= :anchor
        order by p.periodStart desc
    """)
    List<PosPeriodAgg> findRecentPeriods(
            @Param("storeId") Long storeId,
            @Param("periodType") PosPeriodType periodType,
            @Param("anchor") LocalDate anchor,
            Pageable pageable
    );

    @Query("""
        SELECT p
        FROM PosPeriodAgg p
        WHERE p.storeId = :storeId
          AND p.periodType = :type
          AND p.periodStart = :periodStart
    """)
    Optional<PosPeriodAgg> findOneByStoreIdAndPeriod(
            @Param("storeId") Long storeId,
            @Param("type") PosPeriodType type,
            @Param("periodStart") LocalDate periodStart
    );

    @Query("""
        SELECT p
        FROM PosPeriodAgg p
        WHERE p.storeId = :storeId
          AND p.periodType = :type
          AND p.periodStart IN :periodStarts
        ORDER BY p.periodStart ASC
    """)
    List<PosPeriodAgg> findByStoreIdAndPeriodStarts(
            @Param("storeId") Long storeId,
            @Param("type") PosPeriodType type,
            @Param("periodStarts") List<LocalDate> periodStarts
    );
}
