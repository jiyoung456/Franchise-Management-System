package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscInspectionItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscInspectionItemRepository extends JpaRepository<QscInspectionItem, Long> {
    List<QscInspectionItem> findByInspectionId(Long inspectionId);
    void deleteByInspectionId(Long inspectionId);
}
