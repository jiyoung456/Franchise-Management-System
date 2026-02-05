package com.franchise.backend.briefing.repository;

import com.franchise.backend.briefing.dto.Qsc30dDto;
import com.franchise.backend.qsc.entity.QscMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface Qsc30dRepository extends JpaRepository<QscMaster, Long> {

    //=====================
    // 1. sv 유저가 담당하는 점포의
    //=====================
//    @Query("""
//        select new com.franchise.backend.briefing.dto.Qsc30dDto(
//            q.inspectionId,
//            q.storeId,
//            q.confirmedAt,
//            q.totalScore,
//            q.summaryComment
//        )
//        from QscMaster q
//            where q.inspectorId = :userId
//        """)
//    List<Qsc30dDto> findUserInfoByLoginId(@Param("userId") Long userId);
}
