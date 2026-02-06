package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.qsc.repository.projection.QscInspectionListView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.OffsetDateTime;


public interface QscMasterRepository extends JpaRepository<QscMaster, Long> {

    // 점포별 "최신 COMPLETED 점검"을 storeIds 여러 개에 대해 한 번에 조회
    // (store_id별 max(inspected_at) 1건씩)
    @Query("""
        SELECT q
        FROM QscMaster q
        WHERE q.status = 'COMPLETED'
          AND q.storeId IN :storeIds
          AND q.inspectedAt = (
              SELECT MAX(q2.inspectedAt)
              FROM QscMaster q2
              WHERE q2.storeId = q.storeId
                AND q2.status = 'COMPLETED'
          )
    """)
    List<QscMaster> findLatestCompletedByStoreIds(@Param("storeIds") List<Long> storeIds);

    // 특정 점포의 COMPLETED 점검 최신순 목록 (상세 탭에서 사용)
    @Query("""
        SELECT q
        FROM QscMaster q
        WHERE q.storeId = :storeId
          AND q.status = 'COMPLETED'
        ORDER BY q.inspectedAt DESC
    """)
    List<QscMaster> findCompletedListByStoreId(@Param("storeId") Long storeId);

    // 특정 점포의 "최신 COMPLETED 점검 1건" 단건 조회 (상세 상단 QSC 점수용)
    // JPQL에서 LIMIT을 직접 못 쓰니까 서브쿼리로 max(inspectedAt) 1건을 가져온다.
    @Query("""
        SELECT q
        FROM QscMaster q
        WHERE q.storeId = :storeId
          AND q.status = 'COMPLETED'
          AND q.inspectedAt = (
              SELECT MAX(q2.inspectedAt)
              FROM QscMaster q2
              WHERE q2.storeId = :storeId
                AND q2.status = 'COMPLETED'
          )
    """)
    Optional<QscMaster> findLatestCompletedByStoreId(@Param("storeId") Long storeId);

    // 최근 COMPLETED 점검 N개만 가져오기 (이벤트 상세에서 직전 대비 계산)
    List<QscMaster> findByStoreIdAndStatusOrderByInspectedAtDesc(Long storeId, String status, Pageable pageable);


    //조치 효과 조회용
    List<QscMaster> findByStoreIdAndInspectedAtBetweenOrderByInspectedAtAsc(
            Long storeId,
            OffsetDateTime from,
            OffsetDateTime to
    );

    /* =========================
      1. SUMMARY
      ========================= */
    @Query(value = """
        WITH scoped AS (
            SELECT qm.*
            FROM qsc_master qm
            JOIN stores s ON s.store_id = qm.store_id
            WHERE s.current_supervisor_id = :svId
              AND qm.status = 'CONFIRMED'
              AND qm.confirmed_at >= :startInclusive
              AND qm.confirmed_at < :endExclusive
        ),
        latest_per_store AS (
            SELECT *
            FROM (
                SELECT scoped.*,
                       ROW_NUMBER() OVER (PARTITION BY scoped.store_id ORDER BY scoped.confirmed_at DESC) rn
                FROM scoped
            ) t
            WHERE rn = 1
        )
        SELECT
            (SELECT AVG(total_score::numeric)
             FROM scoped
             WHERE total_score IS NOT NULL) AS avgScore,

            (SELECT COUNT(*) FROM scoped) AS doneCount,

            (SELECT COUNT(*) FROM latest_per_store WHERE grade IN ('C','D')) AS riskStoreCount,

            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'S') AS sStoreCount
        """, nativeQuery = true)
    QscDashboardProjection.Summary fetchMonthlySummary(
            @Param("svId") Long svId,
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive
    );

    /* =========================
       2. TREND (최근 6개월)
       ========================= */
    @Query(value = """
        SELECT
            TO_CHAR(
                DATE_TRUNC('month', qm.confirmed_at AT TIME ZONE 'Asia/Seoul'),
                'YYYY-MM'
            ) AS month,
            AVG(qm.total_score::numeric)
                FILTER (WHERE qm.total_score IS NOT NULL) AS avgScore,
            COUNT(*) AS inspectionCount
        FROM qsc_master qm
        JOIN stores s ON s.store_id = qm.store_id
        WHERE s.current_supervisor_id = :svId
          AND qm.status = 'CONFIRMED'
          AND qm.confirmed_at >= :startInclusive
          AND qm.confirmed_at < :endExclusive
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<QscDashboardProjection.TrendRow> fetchTrend(
            @Param("svId") Long svId,
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive
    );

    /* =========================
       3. RANKING (TOP)
       ========================= */
    @Query(value = """
        WITH latest_per_store AS (
            SELECT *
            FROM (
                SELECT qm.store_id,
                       s.store_name,
                       qm.total_score,
                       qm.grade,
                       qm.summary_comment,
                       qm.confirmed_at,
                       ROW_NUMBER() OVER (PARTITION BY qm.store_id ORDER BY qm.confirmed_at DESC) rn
                FROM qsc_master qm
                JOIN stores s ON s.store_id = qm.store_id
                WHERE s.current_supervisor_id = :svId
                  AND qm.status = 'CONFIRMED'
                  AND qm.confirmed_at >= :startInclusive
                  AND qm.confirmed_at < :endExclusive
            ) t
            WHERE rn = 1
        )
        SELECT
            store_id        AS storeId,
            store_name      AS storeName,
            total_score     AS score,
            grade           AS grade,
            summary_comment AS summaryComment,
            confirmed_at    AS confirmedAt
        FROM latest_per_store
        WHERE total_score IS NOT NULL
        ORDER BY total_score DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<QscDashboardProjection.RankingRow> fetchTopRanking(
            @Param("svId") Long svId,
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive,
            @Param("limit") int limit
    );

    /* =========================
       4. RANKING (BOTTOM)
       ========================= */
    @Query(value = """
        WITH latest_per_store AS (
            SELECT *
            FROM (
                SELECT qm.store_id,
                       s.store_name,
                       qm.total_score,
                       qm.grade,
                       qm.summary_comment,
                       qm.confirmed_at,
                       ROW_NUMBER() OVER (PARTITION BY qm.store_id ORDER BY qm.confirmed_at DESC) rn
                FROM qsc_master qm
                JOIN stores s ON s.store_id = qm.store_id
                WHERE s.current_supervisor_id = :svId
                  AND qm.status = 'CONFIRMED'
                  AND qm.confirmed_at >= :startInclusive
                  AND qm.confirmed_at < :endExclusive
            ) t
            WHERE rn = 1
        )
        SELECT
            store_id        AS storeId,
            store_name      AS storeName,
            total_score     AS score,
            grade           AS grade,
            summary_comment AS summaryComment,
            confirmed_at    AS confirmedAt
        FROM latest_per_store
        WHERE total_score IS NOT NULL
        ORDER BY total_score ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<QscDashboardProjection.RankingRow> fetchBottomRanking(
            @Param("svId") Long svId,
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive,
            @Param("limit") int limit
    );

    // 관리자 홈에서 전체 qsc 평균 조회
    @Query(value = """
    SELECT
        TO_CHAR(
            DATE_TRUNC('month',
                COALESCE(qm.confirmed_at, qm.inspected_at) AT TIME ZONE 'Asia/Seoul'
            ),
            'YYYY-MM'
        ) AS month,
        AVG(qm.total_score::numeric)
            FILTER (WHERE qm.total_score IS NOT NULL) AS avgScore,
        COUNT(*) AS inspectionCount
    FROM qsc_master qm
    WHERE qm.status = 'CONFIRMED'
      AND COALESCE(qm.confirmed_at, qm.inspected_at) >= :startInclusive
      AND COALESCE(qm.confirmed_at, qm.inspected_at) < :endExclusive
    GROUP BY 1
    ORDER BY 1
    """, nativeQuery = true)
    List<QscDashboardProjection.TrendRow> fetchAdminTrend(
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive
    );

    // =========================
    // ADMIN SUMMARY (전사)
    // - avgScore: 해당 월의 CONFIRMED 점검 전체 평균
    // - failedStoreCount: 해당 월 "점포별 최신 점검" 기준 grade C/D 점포 수
    // - grade distribution: 점포별 최신 점검 기준 등급 카운트
    // =========================

    @Query(value = """
        WITH scoped AS (
            SELECT qm.*
            FROM qsc_master qm
            JOIN stores s ON s.store_id = qm.store_id
            WHERE s.store_operation_status = 'OPEN'
              AND qm.status = 'CONFIRMED'
              AND COALESCE(qm.confirmed_at, qm.inspected_at) >= :startInclusive
              AND COALESCE(qm.confirmed_at, qm.inspected_at) <  :endExclusive
        ),
        latest_per_store AS (
            SELECT *
            FROM (
                SELECT scoped.*,
                       ROW_NUMBER() OVER (
                           PARTITION BY scoped.store_id
                           ORDER BY COALESCE(scoped.confirmed_at, scoped.inspected_at) DESC
                       ) rn
                FROM scoped
            ) t
            WHERE rn = 1
        )
        SELECT
            (SELECT AVG(total_score::numeric)
             FROM scoped
             WHERE total_score IS NOT NULL) AS avgScore,

            (SELECT COUNT(*) FROM scoped) AS doneCount,

            (SELECT COUNT(*)
             FROM latest_per_store
             WHERE grade IN ('C','D')) AS failedStoreCount,

            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'S') AS gradeS,
            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'A') AS gradeA,
            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'B') AS gradeB,
            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'C') AS gradeC,
            (SELECT COUNT(*) FROM latest_per_store WHERE grade = 'D') AS gradeD
        """, nativeQuery = true)
    QscDashboardProjection.AdminSummary fetchAdminMonthlySummary(
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive
    );

    // =========================
    // ADMIN LIST (전사)
    // - 해당 월 "점포별 최신 점검" 목록
    // - 필터: regionCode(선택), passStatus(선택: PASS/FAIL)
    // =========================
    @Query(value = """
        WITH scoped AS (
            SELECT qm.*
            FROM qsc_master qm
            JOIN stores s ON s.store_id = qm.store_id
            WHERE s.store_operation_status = 'OPEN'
              AND qm.status = 'CONFIRMED'
              AND COALESCE(qm.confirmed_at, qm.inspected_at) >= :startInclusive
              AND COALESCE(qm.confirmed_at, qm.inspected_at) <  :endExclusive
        ),
        latest_per_store AS (
            SELECT *
            FROM (
                SELECT scoped.*,
                       ROW_NUMBER() OVER (
                           PARTITION BY scoped.store_id
                           ORDER BY COALESCE(scoped.confirmed_at, scoped.inspected_at) DESC
                       ) rn
                FROM scoped
            ) t
            WHERE rn = 1
        )
        SELECT
            s.store_id AS storeId,
            s.store_name AS storeName,
            s.region_code AS regionCode,
            u.user_name AS supervisorName,
            l.inspected_at AS inspectedAt,
            l.total_score AS totalScore,
            l.grade AS grade,
            l.is_passed AS isPassed
        FROM latest_per_store l
        JOIN stores s ON s.store_id = l.store_id
        LEFT JOIN users u ON u.user_id = s.current_supervisor_id
        WHERE (:regionCode IS NULL OR s.region_code = :regionCode)
          AND (
            :passFilter IS NULL
            OR (:passFilter = 'PASS' AND l.is_passed = TRUE)
            OR (:passFilter = 'FAIL' AND l.is_passed = FALSE)
          )
        ORDER BY COALESCE(l.confirmed_at, l.inspected_at) DESC
        LIMIT :limit OFFSET :offset
        """, nativeQuery = true)

    List<QscDashboardProjection.AdminListRow> fetchAdminMonthlyLatestList(
            @Param("startInclusive") OffsetDateTime startInclusive,
            @Param("endExclusive") OffsetDateTime endExclusive,
            @Param("regionCode") String regionCode,
            @Param("passFilter") String passFilter, // null / PASS / FAIL
            @Param("limit") int limit,
            @Param("offset") int offset
    );

    @Query("""
    select m
    from QscMaster m
    join Store s on s.id = m.storeId
    where (:region is null or :region = '' or s.regionCode = :region)
      and (:status is null or :status = '' or m.status = :status)
""")
    List<QscMaster> findByCondition(
            @Param("region") String region,
            @Param("status") String status
    );


    //지역, 상태 필터
    @Query("""
        select
            m.inspectionId as inspectionId,
            m.storeId as storeId,
            s.storeName as storeName,
            s.regionCode as regionCode,
            m.status as status,
            u.userName as inspectorName,
            m.inspectedAt as inspectedAt,
            m.totalScore as totalScore,
            m.grade as grade,
            m.isPassed as isPassed
        from QscMaster m
        join Store s on s.id = m.storeId
        join User u on u.id = m.inspectorId
        where (:region is null or :region = '' or s.regionCode = :region)
          and (:status is null or :status = '' or m.status = :status)
        order by m.inspectedAt desc
    """)
    List<QscInspectionListView> findList(
            @Param("region") String region,
            @Param("status") String status
    );



}
