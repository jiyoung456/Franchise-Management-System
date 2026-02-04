package com.franchise.backend.briefing.repository;

import com.franchise.backend.action.entity.Action;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NoActionRepository extends JpaRepository<Action, Long> {
}
