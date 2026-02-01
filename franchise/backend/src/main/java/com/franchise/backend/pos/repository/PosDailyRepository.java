package com.franchise.backend.pos.repository;

import com.franchise.backend.pos.entity.PosDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PosDailyRepository extends JpaRepository<PosDaily, Long> {

    // 최근 7일 매출 합계 (오늘 포함 7일)
    @Query("""
        SELECT COALESCE(SUM(p.salesAmount), 0)
        FROM PosDaily p
        WHERE p.storeId = :storeId
          AND (p.isMissing = false)
          AND p.businessDate >= :fromDate
          AND p.businessDate <= :toDate
    """)
    BigDecimal sumSalesBetween(
            @Param("storeId") Long storeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // 최근 7일 주문 합계
    @Query("""
        SELECT COALESCE(SUM(p.orderCount), 0)
        FROM PosDaily p
        WHERE p.storeId = :storeId
          AND (p.isMissing = false)
          AND p.businessDate >= :fromDate
          AND p.businessDate <= :toDate
    """)
    Long sumOrdersBetween(
            @Param("storeId") Long storeId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    // SV 홈: 담당 점포들 매출 합
    @Query("""
        SELECT COALESCE(SUM(p.salesAmount), 0)
        FROM PosDaily p
        WHERE p.storeId IN :storeIds
          AND (p.isMissing = false)
          AND p.businessDate >= :from
          AND p.businessDate <= :to
    """)
    BigDecimal sumSalesBetweenStoreIds(
            @Param("storeIds") List<Long> storeIds,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    // 기간 내 일별 데이터 (그래프용)
    List<PosDaily> findByStoreIdAndBusinessDateBetweenOrderByBusinessDateAsc(
            Long storeId, LocalDate fromDate, LocalDate toDate
    );


    //담당하는 점포 전체 합산
    @Query("""
    select p
    from PosDaily p
    where p.storeId in :storeIds
      and p.isMissing = false
      and p.businessDate between :fromDate and :toDate
    order by p.businessDate asc
""")
    List<PosDaily> findByStoreIdsAndBusinessDateBetweenOrderByBusinessDateAsc(
            @Param("storeIds") List<Long> storeIds,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );


}
