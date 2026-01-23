package com.franchise.backend.store.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    long countByCurrentState(StoreState currentState);

    // qsc 테이블과 조인해서 qsc 점수와 최근 점검일 변경 예정
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
}
