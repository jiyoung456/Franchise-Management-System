package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplateCategory;
import com.franchise.backend.qsc.entity.QscTemplateItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscTemplateItemRepository
        extends JpaRepository<QscTemplateItem, Long> {

    List<QscTemplateItem>
    findByTemplate_IdOrderByCategory_IdAscSortOrderAsc(Long templateId);
    void deleteByTemplate_Id(Long templateId);
}
