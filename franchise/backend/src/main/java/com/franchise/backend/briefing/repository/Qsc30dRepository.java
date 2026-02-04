package com.franchise.backend.briefing.repository;

import com.franchise.backend.qsc.entity.QscMaster;
import com.franchise.backend.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Qsc30dRepository extends JpaRepository<QscMaster, Long> {
}
