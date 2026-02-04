package com.franchise.backend.notification.repository;

import com.franchise.backend.notification.entity.NotificationGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationGroupRepository extends JpaRepository<NotificationGroup, Long> {

    // dedup_key로 그룹 찾기 (중복 방지 핵심)
    Optional<NotificationGroup> findByDedupKey(String dedupKey);
}
