package com.franchise.backend.board.service;

import com.franchise.backend.board.dto.BoardPostListResponse;
import com.franchise.backend.board.entity.Post;
import com.franchise.backend.board.repository.PostRepository;
import org.springframework.stereotype.Service;
import com.franchise.backend.board.dto.BoardPostDetailResponse;
import com.franchise.backend.board.entity.Post;

import java.util.List;

import org.springframework.transaction.annotation.Transactional;


@Service
public class LeaderBoardService {

    private final PostRepository postRepository;

    public LeaderBoardService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    //전체 목록 조회
    public List<BoardPostListResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc();
        return toDtoList(posts);
    }

    //검색 조회
    public List<BoardPostListResponse> searchPosts(String keyword) {
        List<Post> posts = postRepository
                .findByTitleContainingIgnoreCaseOrCreatedByUserIdOrderByIsPinnedDescCreatedAtDesc(
                        keyword, -1L
                );
        return toDtoList(posts);
    }

    private List<BoardPostListResponse> toDtoList(List<Post> posts) {
        return posts.stream()
                .map(p -> new BoardPostListResponse(
                        p.getId(),
                        p.getTitle(),
                        p.getCreatedByUserId(),
                        p.getCreatedAt(),
                        p.getViewCount(),
                        p.getIsPinned()
                ))
                .toList();
    }

    @Transactional
    public BoardPostDetailResponse getPostDetail(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + postId));

        // 조회수 +1
        post.increaseViewCount();

        return new BoardPostDetailResponse(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                post.getCreatedByUserId(),
                post.getCreatedAt(),
                post.getViewCount(),
                post.getIsPinned()
        );
    }

}
