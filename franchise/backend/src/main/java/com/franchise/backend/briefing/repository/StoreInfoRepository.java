package com.franchise.backend.briefing.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreInfoRepository extends JpaRepository<Store, Long> {

    interface StoreRow {
        Long getStoreId();
        String getStoreName();
        StoreState getCurrentState();
    }

    // SV 담당 점포
    @Query("""
        select
            s.id as storeId,
            s.storeName as storeName,
            s.currentState as currentState
        from Store s
        where s.supervisor.id = :userId
        order by s.currentStateScore desc nulls last, s.id asc
    """)
    List<StoreRow> findStoresBySupervisor(@Param("userId") Long userId);

    // 팀장 지역 점포
    @Query("""
        select
            s.id as storeId,
            s.storeName as storeName,
            s.currentState as currentState
        from Store s
        where s.regionCode = :regionCode
        order by s.currentStateScore desc nulls last, s.id asc
    """)
    List<StoreRow> findStoresByRegion(@Param("regionCode") String regionCode);
}
