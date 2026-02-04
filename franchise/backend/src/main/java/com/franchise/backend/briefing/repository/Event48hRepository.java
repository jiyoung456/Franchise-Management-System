package com.franchise.backend.briefing.repository;

import com.franchise.backend.event.entity.EventLog;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Event48hRepository extends JpaRepository<EventLog, Long> {
}
