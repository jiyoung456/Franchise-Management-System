package com.franchise.backend.risk.repository;

import com.franchise.backend.risk.entity.RiskLevel;
import com.franchise.backend.risk.entity.RiskScoreSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RiskScoreSnapshotRepository extends JpaRepository<RiskScoreSnapshot, Long> {

    // 점포 1개의 최신 위험 스냅샷 1건
    Optional<RiskScoreSnapshot> findFirstByStoreIdOrderByRiskCreatedAtDesc(Long storeId);

    // 대시보드 분포(정상/관찰/위험) 집계할 때 유용: 레벨별 최신 조회는 다음 단계에서
    long countByRiskLevel(RiskLevel riskLevel);
}
