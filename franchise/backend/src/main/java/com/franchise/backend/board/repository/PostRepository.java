package com.franchise.backend.board.repository;

import com.franchise.backend.board.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByIsPinnedDescCreatedAtDesc();
    List<Post> findByTitleContainingIgnoreCaseOrCreatedByUserIdOrderByIsPinnedDescCreatedAtDesc(
            String titleKeyword,
            Long createdByUserId
    );
}
