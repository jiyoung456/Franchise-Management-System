package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscPhotoAiAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscPhotoAiAnalysisRepository extends JpaRepository<QscPhotoAiAnalysis, Long> {
    List<QscPhotoAiAnalysis> findByInspectionIdOrderByAnalysisIdAsc(Long inspectionId);
}
