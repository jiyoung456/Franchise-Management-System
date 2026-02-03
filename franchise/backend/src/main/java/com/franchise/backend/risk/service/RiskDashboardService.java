package com.franchise.backend.risk.service;

import com.franchise.backend.risk.dto.RiskDashboardResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RiskDashboardService {

    private final EntityManager em;

    public RiskDashboardResponse getDashboard() {
        RiskDashboardResponse.RiskDistribution distribution = fetchDistribution();
        List<RiskDashboardResponse.TopRiskFactorItem> top5Factors = fetchTop5Factors();
        List<RiskDashboardResponse.RiskStoreRow> stores = fetchStoreRows();

        return new RiskDashboardResponse(distribution, top5Factors, stores);
    }

    /**
     * 전체 가맹점 리스크 분포 (점포별 "최신 스냅샷 1건" 기준)
     */
    private RiskDashboardResponse.RiskDistribution fetchDistribution() {
        String sql = """
        SELECT
          COALESCE(SUM(CASE WHEN s.current_state = 'NORMAL'    THEN 1 ELSE 0 END), 0) AS normal_cnt,
          COALESCE(SUM(CASE WHEN s.current_state = 'WATCHLIST' THEN 1 ELSE 0 END), 0) AS watchlist_cnt,
          COALESCE(SUM(CASE WHEN s.current_state = 'RISK'      THEN 1 ELSE 0 END), 0) AS risk_cnt
        FROM stores s
        WHERE s.deleted_at IS NULL
        """;

        Object[] row = (Object[]) em.createNativeQuery(sql).getSingleResult();

        int normal = ((Number) row[0]).intValue();
        int watchlist = ((Number) row[1]).intValue();
        int risk = ((Number) row[2]).intValue();

        return new RiskDashboardResponse.RiskDistribution(normal, watchlist, risk);
    }


    /**
     * 전체 점포 주요 위험 요인 TOP 5 (점포별 "최신 스냅샷"의 evidence만 집계)
     */
    private List<RiskDashboardResponse.TopRiskFactorItem> fetchTop5Factors() {
        String sql = """
            WITH latest AS (
              SELECT DISTINCT ON (store_id)
                     risk_snapshot_id
                FROM risk_score_snapshot
               ORDER BY store_id, risk_created_at DESC
            )
            SELECT e.category, COUNT(*) AS cnt
              FROM latest l
              JOIN risk_evidence e ON e.risk_snapshot_id = l.risk_snapshot_id
             GROUP BY e.category
             ORDER BY cnt DESC
             LIMIT 5
            """;

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();

        List<RiskDashboardResponse.TopRiskFactorItem> result = new ArrayList<>();
        for (Object[] r : rows) {
            String category = (String) r[0];
            long count = ((Number) r[1]).longValue();
            result.add(new RiskDashboardResponse.TopRiskFactorItem(category, count));
        }
        return result;
    }

    /**
     * 점포 목록: stores + (점포별 최신 risk_level) + (담당SV user_name) + (최근 QSC 점검일)
     * 위험 점수는 stores.current_state_score 사용.
     */
    private List<RiskDashboardResponse.RiskStoreRow> fetchStoreRows() {

        String sql = """
        WITH last_qsc AS (
          SELECT DISTINCT ON (store_id)
                 store_id,
                 inspected_at
            FROM qsc_master
           WHERE status = 'COMPLETED'
           ORDER BY store_id, inspected_at DESC
        )
        SELECT
          s.store_id,
          s.store_name,
          s.current_state,                 -- ✅ status는 stores.current_state
          s.region_code,
          u.user_name AS supervisor_name,
          s.current_state_score,
          (lq.inspected_at)::date AS last_inspected_date
        FROM stores s
        LEFT JOIN users u ON u.user_id = s.current_supervisor_id
        LEFT JOIN last_qsc lq ON lq.store_id = s.store_id
        WHERE s.deleted_at IS NULL
        ORDER BY
          CASE s.current_state             -- ✅ 정렬도 stores.current_state 기준으로
            WHEN 'RISK' THEN 1
            WHEN 'WATCHLIST' THEN 2
            WHEN 'NORMAL' THEN 3
            ELSE 4
          END,
          s.store_name ASC
        """;

        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createNativeQuery(sql).getResultList();

        List<RiskDashboardResponse.RiskStoreRow> result = new ArrayList<>();
        for (Object[] r : rows) {
            Long storeId = ((Number) r[0]).longValue();
            String storeName = (String) r[1];
            String status = (r[2] == null) ? null : r[2].toString(); // Enum이면 보통 문자열로 옴
            String region = (String) r[3];
            String supervisorName = (String) r[4];
            Integer riskScore = (r[5] == null) ? null : ((Number) r[5]).intValue();

            LocalDate lastInspectedAt = null;
            if (r[6] != null) {
                if (r[6] instanceof java.sql.Date d) lastInspectedAt = d.toLocalDate();
                else lastInspectedAt = LocalDate.parse(r[6].toString());
            }

            result.add(new RiskDashboardResponse.RiskStoreRow(
                    storeId, storeName, status, region, supervisorName, riskScore, lastInspectedAt
            ));
        }
        return result;
    }


}
