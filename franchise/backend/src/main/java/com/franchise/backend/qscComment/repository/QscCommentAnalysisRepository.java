package com.franchise.backend.qscComment.repository;

import com.franchise.backend.qscComment.entity.QscCommentAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QscCommentAnalysisRepository
        extends JpaRepository<QscCommentAnalysis, Long> {
}

