package com.franchise.backend.briefing.repository;

import com.franchise.backend.action.entity.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NoActionRepository extends JpaRepository<Action, Long> {

    interface NoActionRow {
        Long getActionId();
        Long getStoreId();
        String getStoreName();
        String getTitle();
        String getDescription();
    }

    @Query("""
        select
            a.id as actionId,
            a.storeId as storeId,
            s.storeName as storeName,
            a.title as title,
            a.description as description
        from Action a
        join Store s on s.id = a.storeId
        where s.supervisor.id = :userId
          and a.status = 'OPEN'
        order by a.createdAt desc
    """)
    List<NoActionRow> findOpenBySupervisor(@Param("userId") Long userId);

    @Query("""
        select
            a.id as actionId,
            a.storeId as storeId,
            s.storeName as storeName,
            a.title as title,
            a.description as description
        from Action a
        join Store s on s.id = a.storeId
        where s.regionCode = :regionCode
          and a.status = 'OPEN'
        order by a.createdAt desc
    """)
    List<NoActionRow> findOpenByRegion(@Param("regionCode") String regionCode);
}
