package com.franchise.backend.store.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    long countByCurrentState(StoreState currentState);

    // 팀장 홈 : "팀장 부서(department)" 기준 점포 목록 조회
    // - 같은 부서의 SV가 담당(supervisor)인 점포만
    @Query("""
        SELECT s
        FROM Store s
        JOIN s.supervisor u
        WHERE (:state IS NULL OR s.currentState = :state)
          AND (:department IS NULL OR u.department = :department)
          AND (
                :keyword IS NULL
                OR s.storeName LIKE %:keyword%
                OR u.loginId LIKE %:keyword%
          )
        ORDER BY s.updatedAt DESC
    """)
    List<Store> searchStoresForManager(
            @Param("state") StoreState state,
            @Param("keyword") String keyword,
            @Param("department") String department
    );

    // SV 홈 : LoginId로 담당 점포 전체 조회
    @Query("""
        SELECT s
        FROM Store s
        JOIN s.supervisor u
        WHERE u.loginId = :loginId
    """)

    List<Store> findBySupervisorLoginId(@Param("loginId") String loginId);

    List<Store> findBySupervisor_Id(Long supervisorId);
}
