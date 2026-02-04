package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.dto.Pos7dDto;
import com.franchise.backend.pos.entity.PosPeriodAgg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface Pos7dRepository extends JpaRepository<PosPeriodAgg, Long> {

//    @Query("""
//        select new com.franchise.backend.pos.dto.Pos7dDto(
//            p.posPeriodAggId,
//            p.storeId,
//            p.aov,
//            p.saleAmount,
//            p.orderCount,
//            p.cogsAmount,
//            p.marginAmount,
//            p.marginRate,
//            p.saleChangeRate,
//            p.orderChangeRate,
//            p.aovChangeRate
//        )
//        from PosPeriodAgg p
//        where p.storeId = :storeId
//          and p.periodType = :periodType
//          and p.periodStart >= :startDate
//          and p.periodEnd <= :endDate
//    """)
//    List<Pos7dDto> findPos7dAgg(
//            @Param("storeId") Long storeId,
//            @Param("periodType") String periodType,
//            @Param("startDate") LocalDate startDate,
//            @Param("endDate") LocalDate endDate
//    );
}
