package com.franchise.backend.briefing.repository;

import com.franchise.backend.pos.entity.PosPeriodAgg;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Pos7dRepository extends JpaRepository<PosPeriodAgg, Long> {
}
