package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplateScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscTemplateScopeRepository
        extends JpaRepository<QscTemplateScope, Long> {

    List<QscTemplateScope> findByTemplate_Id(Long templateId);

    void deleteByTemplate_Id(Long templateId);
}
