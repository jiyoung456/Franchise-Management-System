package com.franchise.backend.briefing.repository;

import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.pos.entity.PosPeriodAgg.PosPeriodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface Pos7dRepository extends JpaRepository<PosPeriodAgg, Long> {

    interface Pos7dRow {
        Long getPosPeriodAggId();
        Long getStoreId();
        BigDecimal getAov();
        BigDecimal getSalesAmount();
        Integer getOrderCount();
        BigDecimal getCogsAmount();
        BigDecimal getMarginAmount();
        BigDecimal getMarginRate();
        BigDecimal getSalesChangeRate();
        BigDecimal getOrderChangeRate();
        BigDecimal getAovChangeRate();
        LocalDate getPeriodEnd();
    }

    @Query("""
        select
            p.id as posPeriodAggId,
            p.storeId as storeId,
            p.aov as aov,
            p.salesAmount as salesAmount,
            p.orderCount as orderCount,
            p.cogsAmount as cogsAmount,
            p.marginAmount as marginAmount,
            p.marginRate as marginRate,
            p.salesChangeRate as salesChangeRate,
            p.orderChangeRate as orderChangeRate,
            p.aovChangeRate as aovChangeRate,
            p.periodEnd as periodEnd
        from PosPeriodAgg p
        join Store s on s.id = p.storeId
        where s.supervisor.id = :userId
          and p.periodType = :periodType
          and p.periodEnd >= :fromDate
        order by p.periodEnd desc
    """)
    List<Pos7dRow> findPos7dBySupervisor(
            @Param("userId") Long userId,
            @Param("periodType") PosPeriodType periodType,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
        select
            p.id as posPeriodAggId,
            p.storeId as storeId,
            p.aov as aov,
            p.salesAmount as salesAmount,
            p.orderCount as orderCount,
            p.cogsAmount as cogsAmount,
            p.marginAmount as marginAmount,
            p.marginRate as marginRate,
            p.salesChangeRate as salesChangeRate,
            p.orderChangeRate as orderChangeRate,
            p.aovChangeRate as aovChangeRate,
            p.periodEnd as periodEnd
        from PosPeriodAgg p
        join Store s on s.id = p.storeId
        where s.regionCode = :regionCode
          and p.periodType = :periodType
          and p.periodEnd >= :fromDate
        order by p.periodEnd desc
    """)
    List<Pos7dRow> findPos7dByRegion(
            @Param("regionCode") String regionCode,
            @Param("periodType") PosPeriodType periodType,
            @Param("fromDate") LocalDate fromDate
    );
}
