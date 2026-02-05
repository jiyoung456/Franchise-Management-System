package com.franchise.backend.qscComment.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QscCommentRepository extends JpaRepository<QscMaster, Long> {

    /**
     * SV 전용: 특정 inspectionId의 summaryComment(총평) 원문만 조회
     * - 본인 담당 점포인지 확인(Store.supervisor.id)
     * - QSC 상태는 CONFIRMED만 허용
     * - summaryComment null/빈문자 제외
     */
    @Query("""
        select qm.summaryComment
        from QscMaster qm
        join Store s on s.id = qm.storeId
        where qm.inspectionId = :inspectionId
          and s.supervisor.id = :userId
          and qm.status = 'CONFIRMED'
          and qm.summaryComment is not null
          and trim(qm.summaryComment) <> ''
    """)
    Optional<String> findConfirmedSummaryCommentForSupervisor(
            @Param("inspectionId") Long inspectionId,
            @Param("userId") Long userId
    );
}
