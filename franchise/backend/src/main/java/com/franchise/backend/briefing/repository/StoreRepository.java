package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.dto.StoreDto;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    //=====================
    // 1. 유저가 담당하는 점포 조회
    //=====================
    @Query("""
        select new com.franchise.backend.briefing.dto.StoreDto(
            s.storeId,
            s.storeName,
            s.currentState
        )
        from Store s
        where s.currentSupervisorId = :userId
    """)
    List<StoreDto> findStoresBySupervisorId(
            @Param("userId") Long userId
    );
}
