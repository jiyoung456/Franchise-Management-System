package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.entity.AgentBriefings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgentBriefingsRepository
        extends JpaRepository<AgentBriefings, Long> {
}

