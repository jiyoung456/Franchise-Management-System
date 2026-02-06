package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplateCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QscTemplateCategoryRepository
        extends JpaRepository<QscTemplateCategory, Long> {

    List<QscTemplateCategory>
    findByTemplate_IdOrderByIdAsc(Long templateId);
    Optional<QscTemplateCategory> findByTemplate_IdAndCategoryCode(Long templateId, com.franchise.backend.qsc.entity.QscCategoryCode code);
    void deleteByTemplate_Id(Long templateId);
}
