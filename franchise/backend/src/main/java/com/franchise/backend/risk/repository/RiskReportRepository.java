package com.franchise.backend.risk.repository;

import com.franchise.backend.risk.entity.RiskReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RiskReportRepository extends JpaRepository<RiskReport, Integer> {

    Optional<RiskReport> findTopByStoreIdOrderBySnapshotDateDesc(Integer storeId);

    List<RiskReport> findByStoreIdOrderBySnapshotDateDesc(Integer storeId);

    Optional<RiskReport> findByStoreIdAndSnapshotDate(Integer storeId, LocalDate snapshotDate);
}
