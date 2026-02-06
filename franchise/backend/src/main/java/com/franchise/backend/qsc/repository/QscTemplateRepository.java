package com.franchise.backend.qsc.repository;

import com.franchise.backend.qsc.entity.QscTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface QscTemplateRepository extends JpaRepository<QscTemplate, Long> {

    List<QscTemplate> findAllByOrderByEffectiveFromDesc();

    /**
     * ADMIN 템플릿 목록 검색
     * - Postgres enum 컬럼(inspection_type/status) 때문에 enum = varchar 비교가 터질 수 있어 native + ::text로 해결
     * - type/status는 "REGULAR", "ACTIVE" 같은 문자열로 받는다(없으면 null)
     */
    @Query(value = """
        select *
        from qsc_template qt
        where (:type is null or qt.inspection_type::text = :type)
          and (:status is null or qt.status::text = :status)
          and (:keyword is null or :keyword = '' or qt.template_name ilike ('%' || :keyword || '%'))
        order by qt.effective_from desc
        """, nativeQuery = true)
    List<QscTemplate> searchAdminTemplates(
            @Param("type") String type,       // e.g. "REGULAR"
            @Param("status") String status,   // e.g. "ACTIVE"
            @Param("keyword") String keyword
    );
}
