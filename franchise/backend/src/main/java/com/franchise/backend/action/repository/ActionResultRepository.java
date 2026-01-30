package com.franchise.backend.action.repository;

import com.franchise.backend.action.entity.ActionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ActionResultRepository extends JpaRepository<ActionResult, Long> {
    Optional<ActionResult> findByAction_Id(Long actionId);
}
