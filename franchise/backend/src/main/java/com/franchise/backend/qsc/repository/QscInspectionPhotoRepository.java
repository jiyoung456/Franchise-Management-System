package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscInspectionPhoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QscInspectionPhotoRepository extends JpaRepository<QscInspectionPhoto, Long> {
    List<QscInspectionPhoto> findByInspectionIdOrderByIdAsc(Long inspectionId);
}

