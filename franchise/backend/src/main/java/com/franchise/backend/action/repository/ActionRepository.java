package com.franchise.backend.action.repository;

import com.franchise.backend.action.entity.Action;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActionRepository extends JpaRepository<Action, Long> {
    List<Action> findAllByOrderByPriorityAscDueDateAsc();
    List<Action> findByStoreIdOrderByDueDateAsc(Long storeId);

    long countByStoreIdInAndStatusIn(List<Long> storeIds, List<String> statuses);
    long countByStatusIn(List<String> statuses);

}
