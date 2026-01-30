package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.QscStoreStatusProjection.Row;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface QscStoreStatusRepository extends JpaRepository<QscMaster, Long> {

    /**
     * SV 담당 점포 목록 + (전체 최신 점검 1건) + (이번달 점검 건수)
     * - 최신 점검: 전체 기간 CONFIRMED 중 store별 confirmed_at 최신 1건
     * - 이번달 점검 건수: 월 범위(KST 계산은 service에서) 내 CONFIRMED count
     * - keyword: store_name 검색 (null이면 전체)
     */
    @Query(value = """
        with my_stores as (
            select s.store_id, s.store_name, s.region_code
            from stores s
            where s.current_supervisor_id = :svId
              and (:keyword is null or s.store_name ilike '%' || :keyword || '%')
        ),
        latest_per_store as (
            select *
            from (
                select qm.store_id,
                       qm.grade as latest_grade,
                       qm.confirmed_at as latest_confirmed_at,
                       row_number() over (partition by qm.store_id order by qm.confirmed_at desc) as rn
                from qsc_master qm
                join my_stores ms on ms.store_id = qm.store_id
                where qm.status = 'CONFIRMED'
                  and qm.confirmed_at is not null
            ) t
            where t.rn = 1
        ),
        month_counts as (
            select qm.store_id,
                   count(*) as this_month_inspection_count
            from qsc_master qm
            join my_stores ms on ms.store_id = qm.store_id
            where qm.status = 'CONFIRMED'
              and qm.confirmed_at >= :startInclusive
              and qm.confirmed_at < :endExclusive
            group by qm.store_id
        )
        select
            ms.store_id as "storeId",
            ms.store_name as "storeName",
            ms.region_code as "regionCode",
            lp.latest_grade as "latestGrade",
            lp.latest_confirmed_at as "latestConfirmedAt",
            coalesce(mc.this_month_inspection_count, 0) as "thisMonthInspectionCount"
        from my_stores ms
        left join latest_per_store lp on lp.store_id = ms.store_id
        left join month_counts mc on mc.store_id = ms.store_id
        order by ms.store_name asc
        """, nativeQuery = true)
    List<Row> fetchStoreStatusRows(
            @Param("svId") Long svId,
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive,
            @Param("keyword") String keyword
    );
}
