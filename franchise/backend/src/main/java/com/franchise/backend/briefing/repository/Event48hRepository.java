package com.franchise.backend.briefing.repository;

import com.franchise.backend.event.entity.EventLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;

public interface Event48hRepository extends JpaRepository<EventLog, Long> {

    interface Event48hRow {
        Long getEventId();
        Long getStoreId();
        String getStoreName();
        String getEventType();
        String getSeverity();
        String getSummary();
        OffsetDateTime getOccurredAt();
    }

    @Query("""
        select
            e.eventId as eventId,
            e.storeId as storeId,
            s.storeName as storeName,
            e.eventType as eventType,
            e.severity as severity,
            e.summary as summary,
            e.occurredAt as occurredAt
        from EventLog e
        join Store s on s.id = e.storeId
        where s.supervisor.id = :userId
          and e.occurredAt >= :fromDateTime
        order by e.occurredAt desc
    """)
    List<Event48hRow> findRecent48hBySupervisor(
            @Param("userId") Long userId,
            @Param("fromDateTime") OffsetDateTime fromDateTime
    );

    @Query("""
        select
            e.eventId as eventId,
            e.storeId as storeId,
            s.storeName as storeName,
            e.eventType as eventType,
            e.severity as severity,
            e.summary as summary,
            e.occurredAt as occurredAt
        from EventLog e
        join Store s on s.id = e.storeId
        where s.regionCode = :regionCode
          and e.occurredAt >= :fromDateTime
        order by e.occurredAt desc
    """)
    List<Event48hRow> findRecent48hByRegion(
            @Param("regionCode") String regionCode,
            @Param("fromDateTime") OffsetDateTime fromDateTime
    );
}
