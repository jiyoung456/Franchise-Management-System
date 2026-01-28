package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplate;
import com.franchise.backend.qsc.entity.QscTemplateStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscTemplateRepository extends JpaRepository<QscTemplate, Long> {
    List<QscTemplate> findAllByOrderByEffectiveFromDesc();
}

