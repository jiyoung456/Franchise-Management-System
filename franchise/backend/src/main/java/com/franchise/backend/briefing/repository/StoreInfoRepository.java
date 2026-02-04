package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.dto.StoreInfoDto;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StoreInfoRepository extends JpaRepository<Store, Long> {

    //=====================
    // 1. sv 유저가 담당하는 점포 조회
    //=====================
    @Query("""
        select new com.franchise.backend.briefing.dto.StoreInfoDto(
            s.id,
            s.storeName,
            s.currentState
        )
        from Store s
            where s.supervisor.id = :userId
        """)
    List<StoreInfoDto> findUserInfoByLoginId(@Param("userId") Long userId);

}
