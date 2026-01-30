package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplateCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscTemplateCategoryRepository
        extends JpaRepository<QscTemplateCategory, Long> {

    List<QscTemplateCategory>
    findByTemplate_IdOrderByIdAsc(Long templateId);
}
