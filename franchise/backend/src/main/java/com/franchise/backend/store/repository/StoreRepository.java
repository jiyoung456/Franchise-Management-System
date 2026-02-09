package com.franchise.backend.store.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.store.entity.StoreState;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    long countByCurrentState(StoreState currentState);

    long countByCurrentStateAndIdIn(StoreState currentState, List<Long> ids);

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

    // SV 점포 관리 : 상태/키워드 필터 포함
    @Query("""
        SELECT s
        FROM Store s
        JOIN s.supervisor u
        WHERE u.loginId = :loginId
          AND (:state IS NULL OR s.currentState = :state)
          AND (
                :keyword IS NULL
                OR s.storeName LIKE %:keyword%
          )
        ORDER BY
      (CASE WHEN s.currentStateScore IS NULL THEN 1 ELSE 0 END) ASC,
      s.currentStateScore DESC,
      s.updatedAt DESC
""")
    List<Store> searchStoresForSupervisor(
            @Param("loginId") String loginId,
            @Param("state") StoreState state,
            @Param("keyword") String keyword
    );

    @Query("""
    SELECT s
    FROM Store s
    JOIN s.supervisor u
    WHERE u.loginId = :loginId
      AND (:state IS NULL OR s.currentState = :state)
      AND (
            :keyword IS NULL
            OR s.storeName LIKE %:keyword%
      )
    ORDER BY
      (CASE WHEN s.currentStateScore IS NULL THEN 1 ELSE 0 END) ASC,
      s.currentStateScore DESC,
      s.updatedAt DESC
""")
    List<Store> searchStoresForSupervisorOrderByRisk(
            @Param("loginId") String loginId,
            @Param("state") StoreState state,
            @Param("keyword") String keyword,
            Pageable pageable
    );


    // sv 기준 : 본인이 담당하는 점포 ID들
    @Query("""
        SELECT s.id
        FROM Store s
        JOIN s.supervisor u
        WHERE u.loginId = :loginId
    """)
    List<Long> findStoreIdsBySupervisorLoginId(@Param("loginId") String loginId);

    // 팀장 기준 : 해당 부서 SV들이 담당하는 점포 ID들
    @Query("""
        SELECT s.id
        FROM Store s
        JOIN s.supervisor u
        WHERE u.department = :department
    """)
    List<Long> findStoreIdsBySupervisorDepartment(@Param("department") String department);

    // ADMIN 홈: 위험 점포 TOP5 (current_state=RISK, current_state_score desc)
    // JPQL은 NULLS LAST가 애매해서 CASE로 null 처리
    @Query("""
        SELECT s
        FROM Store s
        WHERE s.currentState = com.franchise.backend.store.entity.StoreState.RISK
        ORDER BY
          (CASE WHEN s.currentStateScore IS NULL THEN 1 ELSE 0 END) ASC,
          s.currentStateScore DESC,
          s.updatedAt DESC
    """)
    List<Store> findTopRiskStores(Pageable pageable);

    // 관리자 전체 점포 목록
    @Query("""
        SELECT s
        FROM Store s
        LEFT JOIN s.supervisor u
        WHERE (:state IS NULL OR s.currentState = :state)
          AND (
                :keyword IS NULL
                OR s.storeName LIKE %:keyword%
                OR u.loginId LIKE %:keyword%
                OR u.userName LIKE %:keyword%
          )
        ORDER BY s.updatedAt DESC
    """)
    List<Store> searchStoresForAdmin(
            @Param("state") StoreState state,
            @Param("keyword") String keyword
    );

    List<Store> findBySupervisor_Id(Long supervisorId);

    //관리자 기준 모든 점포 조회
    @Query("""
        SELECT s.id
        FROM Store s
    """)
    List<Long> findAllStoreIds();

    //  open한 매장 수
    long countByStoreOperationStatus(String storeOperationStatus);

}



