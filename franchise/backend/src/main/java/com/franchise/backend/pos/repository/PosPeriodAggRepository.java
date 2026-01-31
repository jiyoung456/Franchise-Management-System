package com.franchise.backend.pos.repository;

import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

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
}
