package com.franchise.backend.risk.repository;

import com.franchise.backend.risk.entity.RiskEvidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RiskEvidenceRepository extends JpaRepository<RiskEvidence, Long> {

    @Query("""
        SELECT r.category, COUNT(r)
        FROM RiskEvidence r
        GROUP BY r.category
        ORDER BY COUNT(r) DESC
    """)
    List<Object[]> findTopRiskCategories();
}
