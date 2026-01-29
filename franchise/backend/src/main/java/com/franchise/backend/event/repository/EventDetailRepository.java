package com.franchise.backend.event.repository;

import com.franchise.backend.event.dto.EventDetailResponse;
import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventDetailRepository extends Repository<EventLog, Long> {

    @Query("""
        SELECT new com.franchise.backend.event.dto.EventDetailResponse(
            e.eventId,
            e.storeId,
            s.storeName,
            e.eventType,
            CASE
                WHEN e.eventType LIKE 'POS_%' THEN 'POS'
                WHEN e.eventType LIKE 'QSC_%' THEN 'QSC'
                WHEN e.eventType LIKE 'RISK_%' THEN 'RISK'
                WHEN e.eventType LIKE 'SM_%' THEN 'SM'
                ELSE 'OPS'
            END,
            e.severity,
            e.status,
            e.summary,
            e.occurredAt,
            s.currentStateScore,
            null
        )
        FROM EventLog e, Store s
        WHERE e.storeId = s.id
          AND e.eventId = :eventId
          AND (:storeIds IS NULL OR e.storeId IN :storeIds)
    """)
    Optional<EventDetailResponse> findEventDetail(
            @Param("eventId") Long eventId,
            @Param("storeIds") List<Long> storeIds
    );
}
