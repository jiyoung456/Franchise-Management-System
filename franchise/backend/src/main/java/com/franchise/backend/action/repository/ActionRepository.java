package com.franchise.backend.action.repository;

import com.franchise.backend.action.entity.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActionRepository extends JpaRepository<Action, Long> {

    // (기존) 전체 다 가져오는 쿼리 - 팀장 화면에서는 더 이상 쓰지 않도록 서비스에서 교체
    List<Action> findAllByOrderByPriorityAscDueDateAsc();

    List<Action> findByStoreIdOrderByDueDateAsc(Long storeId);

    long countByStoreIdInAndStatusIn(List<Long> storeIds, List<String> statuses);
    long countByStatusIn(List<String> statuses);

    // 팀장 조치 관리: "팀장 부서 SV 점포" + "이벤트 연계" + "상태(옵션)"
    @Query("""
        SELECT a
        FROM Action a
        WHERE a.storeId IN :storeIds
          AND a.relatedEventId IS NOT NULL
          AND (:status IS NULL OR a.status = :status)
        ORDER BY a.priority ASC, a.dueDate ASC
    """)
    List<Action> findManagerScopedActions(
            @Param("storeIds") List<Long> storeIds,
            @Param("status") String status
    );
}
