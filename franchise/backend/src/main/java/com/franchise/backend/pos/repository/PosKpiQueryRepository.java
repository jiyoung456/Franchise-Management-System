package com.franchise.backend.pos.repository;

import com.franchise.backend.pos.entity.PosDaily;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PosKpiQueryRepository extends Repository<PosDaily, Long> {

    // 주간 집계(최근 limit개) + 전주 대비 증감률 계산
    // - period_start: 주 시작일(월요일 기준 date_trunc('week'))
    @Query(value = """
        WITH agg AS (
          SELECT
            date_trunc('week', business_date)::date AS period_start,
            COALESCE(SUM(sales_amount), 0) AS sales_sum,
            COALESCE(SUM(order_count), 0)  AS orders_sum
          FROM pos_daily
          WHERE store_id = :storeId
            AND (is_missing IS NULL OR is_missing = FALSE)
          GROUP BY 1
        ),
        calc AS (
          SELECT
            period_start,
            sales_sum,
            orders_sum,
            CASE WHEN orders_sum = 0 THEN 0 ELSE (sales_sum / orders_sum) END AS aov,
            LAG(sales_sum)  OVER (ORDER BY period_start) AS prev_sales,
            LAG(orders_sum) OVER (ORDER BY period_start) AS prev_orders,
            LAG(CASE WHEN orders_sum = 0 THEN 0 ELSE (sales_sum / orders_sum) END)
              OVER (ORDER BY period_start) AS prev_aov
          FROM agg
        )
        SELECT
          period_start,
          sales_sum,
          orders_sum,
          aov,
          CASE WHEN prev_sales IS NULL OR prev_sales = 0 THEN NULL
               ELSE (sales_sum - prev_sales) / prev_sales END AS sales_rate,
          CASE WHEN prev_orders IS NULL OR prev_orders = 0 THEN NULL
               ELSE (orders_sum - prev_orders)::numeric / prev_orders END AS orders_rate,
          CASE WHEN prev_aov IS NULL OR prev_aov = 0 THEN NULL
               ELSE (aov - prev_aov) / prev_aov END AS aov_rate
        FROM calc
        ORDER BY period_start DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findWeeklySeries(@Param("storeId") Long storeId, @Param("limit") int limit);

    // 월간 집계(최근 limit개) + 전월 대비 증감률 계산
    @Query(value = """
        WITH agg AS (
          SELECT
            date_trunc('month', business_date)::date AS period_start,
            COALESCE(SUM(sales_amount), 0) AS sales_sum,
            COALESCE(SUM(order_count), 0)  AS orders_sum
          FROM pos_daily
          WHERE store_id = :storeId
            AND (is_missing IS NULL OR is_missing = FALSE)
          GROUP BY 1
        ),
        calc AS (
          SELECT
            period_start,
            sales_sum,
            orders_sum,
            CASE WHEN orders_sum = 0 THEN 0 ELSE (sales_sum / orders_sum) END AS aov,
            LAG(sales_sum)  OVER (ORDER BY period_start) AS prev_sales,
            LAG(orders_sum) OVER (ORDER BY period_start) AS prev_orders,
            LAG(CASE WHEN orders_sum = 0 THEN 0 ELSE (sales_sum / orders_sum) END)
              OVER (ORDER BY period_start) AS prev_aov
          FROM agg
        )
        SELECT
          period_start,
          sales_sum,
          orders_sum,
          aov,
          CASE WHEN prev_sales IS NULL OR prev_sales = 0 THEN NULL
               ELSE (sales_sum - prev_sales) / prev_sales END AS sales_rate,
          CASE WHEN prev_orders IS NULL OR prev_orders = 0 THEN NULL
               ELSE (orders_sum - prev_orders)::numeric / prev_orders END AS orders_rate,
          CASE WHEN prev_aov IS NULL OR prev_aov = 0 THEN NULL
               ELSE (aov - prev_aov) / prev_aov END AS aov_rate
        FROM calc
        ORDER BY period_start DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Object[]> findMonthlySeries(@Param("storeId") Long storeId, @Param("limit") int limit);

    // 기준선(pos_baseline) - 현재 유효한 최신버전 1건
    // metric: SALES / ORDER_COUNT / AOV  (너가 서비스에서 쓰는 값에 맞춰야 함)
    @Query(value = """
        SELECT b.baseline_value, b.threshold_rate
        FROM pos_baseline b
        WHERE b.store_id = :storeId
          AND b.period_type = :periodType
          AND b.metric = :metric
          AND (b.effective_from IS NULL OR b.effective_from <= CURRENT_DATE)
          AND (b.effective_to   IS NULL OR b.effective_to   >= CURRENT_DATE)
        ORDER BY b.version DESC
        LIMIT 1
        """, nativeQuery = true)
    List<Object[]> findBaseline(@Param("storeId") Long storeId,
                                @Param("periodType") String periodType,
                                @Param("metric") String metric);
}
