package com.franchise.backend.store.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    long countByCurrentState(StoreState currentState);

    // 팀장 홈 : 점포 목록 검색
    @Query("""
        SELECT s
        FROM Store s
        LEFT JOIN s.supervisor u
        WHERE (:state IS NULL OR s.currentState = :state)
          AND (
                :keyword IS NULL
                OR s.storeName LIKE %:keyword%
                OR u.loginId LIKE %:keyword%
          )
        ORDER BY s.updatedAt DESC
    """)
    List<Store> searchStores(
            @Param("state") StoreState state,
            @Param("keyword") String keyword
    );

    // SV 홈 : LoginId로 담당 점포 전체 조회
    @Query("""
        SELECT s
        FROM Store s
        JOIN s.supervisor u
        WHERE u.loginId = :loginId
    """)
    List<Store> findBySupervisorLoginId(@Param("loginId") String loginId);
}
