package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscInspectionItem;
import com.franchise.backend.qsc.repository.projection.InspectionItemDetailView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QscInspectionItemRepository extends JpaRepository<QscInspectionItem, Long> {

    List<QscInspectionItem> findByInspectionId(Long inspectionId);

    @Query("""
        select
            i.templateItemId as templateItemId,
            i.score as score,
            c.id as categoryId,
            c.categoryCode as categoryCode,
            c.categoryName as categoryName,
            c.categoryWeight as categoryWeight,
            t.itemName as itemName,
            t.sortOrder as sortOrder
        from QscInspectionItem i
        join QscTemplateItem t on t.id = i.templateItemId
        join t.category c
        where i.inspectionId = :inspectionId
        order by c.id asc, t.sortOrder asc
    """)
    List<InspectionItemDetailView> findDetailViewsByInspectionId(@Param("inspectionId") Long inspectionId);
}
