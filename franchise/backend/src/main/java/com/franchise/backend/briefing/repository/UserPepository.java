package com.franchise.backend.briefing.repository;

import com.franchise.backend.store.entity.Store;
import com.franchise.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserPepository extends JpaRepository<User, Long> {
}
