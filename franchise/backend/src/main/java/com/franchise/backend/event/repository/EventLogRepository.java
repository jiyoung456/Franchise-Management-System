package com.franchise.backend.event.repository;

import com.franchise.backend.event.entity.EventLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface EventLogRepository extends JpaRepository<EventLog, Long> {

    // 팀장 홈 : 최근 48시간 신규 이벤트 수
    @Query("""
        SELECT COUNT(e)
        FROM EventLog e
        WHERE e.occurredAt >= :since
    """)
    long countNewEventsSince(@Param("since") OffsetDateTime since);

    //SV 홈: 담당 점포들 기준 최근 이벤트 수(48h)
    @Query("""
        SELECT COUNT(e)
        FROM EventLog e
        WHERE e.storeId IN :storeIds
          AND e.occurredAt >= :since
    """)
    long countNewEventsSinceForStores(
            @Param("storeIds") List<Long> storeIds,
            @Param("since") OffsetDateTime since
    );

    // 점포 상세 : 해당 점포 이벤트 최신순
    List<EventLog> findByStoreIdOrderByOccurredAtDesc(Long storeId, Pageable pageable);

    // 이벤트 관리 : OPEN 이벤트 수
    @Query("""
        SELECT COUNT(e)
        FROM EventLog e
        WHERE e.status = 'OPEN'
    """)
    long countOpenEvents();

    // 이벤트 관리 : CRITICAL 위험 수 (보통 OPEN 기준)
    @Query("""
        SELECT COUNT(e)
        FROM EventLog e
        WHERE e.status = 'OPEN'
          AND e.severity = 'CRITICAL'
    """)
    long countCriticalOpenEvents();
}
