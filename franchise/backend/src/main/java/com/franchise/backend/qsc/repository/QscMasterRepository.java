package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscMaster;
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
}
