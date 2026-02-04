package com.franchise.backend.qscComment.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QscCommentRepository extends JpaRepository<QscMaster, Long> {
}
