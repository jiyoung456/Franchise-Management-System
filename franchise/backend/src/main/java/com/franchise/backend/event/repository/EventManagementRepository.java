package com.franchise.backend.event.repository;

import com.franchise.backend.event.dto.EventListItemResponse;
import com.franchise.backend.event.entity.EventLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventManagementRepository extends Repository<EventLog, Long> {

    @Query("""
        SELECT new com.franchise.backend.event.dto.EventListItemResponse(
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
            s.currentStateScore
        )
        FROM EventLog e
        JOIN com.franchise.backend.store.entity.Store s ON e.storeId = s.id
        JOIN s.supervisor u
        WHERE u.department = :department
          AND (:status IS NULL OR e.status = :status)
          AND (:keyword IS NULL OR s.storeName LIKE %:keyword%)
        ORDER BY e.occurredAt DESC
    """)
    List<EventListItemResponse> searchEventsForManagerDepartment(
            @Param("department") String department,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
