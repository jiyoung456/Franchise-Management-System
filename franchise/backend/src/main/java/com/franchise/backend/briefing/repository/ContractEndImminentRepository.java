package com.franchise.backend.briefing.repository;

import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ContractEndImminentRepository extends JpaRepository<Store, Long> {

    interface ContractRow {
        Long getStoreId();
        String getStoreName();
        LocalDate getContractEndDate();
    }

    @Query("""
        select
            s.id as storeId,
            s.storeName as storeName,
            s.contractEndDate as contractEndDate
        from Store s
        where s.supervisor.id = :userId
          and s.contractEndDate is not null
          and s.contractEndDate <= :cutoffDate
        order by s.contractEndDate asc
    """)
    List<ContractRow> findImminentBySupervisor(
            @Param("userId") Long userId,
            @Param("cutoffDate") LocalDate cutoffDate
    );

    @Query("""
        select
            s.id as storeId,
            s.storeName as storeName,
            s.contractEndDate as contractEndDate
        from Store s
        where s.regionCode = :regionCode
          and s.contractEndDate is not null
          and s.contractEndDate <= :cutoffDate
        order by s.contractEndDate asc
    """)
    List<ContractRow> findImminentByRegion(
            @Param("regionCode") String regionCode,
            @Param("cutoffDate") LocalDate cutoffDate
    );
}
