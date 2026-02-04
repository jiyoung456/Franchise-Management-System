package com.franchise.backend.event.repository;

import com.franchise.backend.event.entity.EventRule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRuleRepository extends JpaRepository<EventRule, Long> {
}
