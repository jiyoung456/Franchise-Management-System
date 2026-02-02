package com.franchise.backend.board.service;

import com.franchise.backend.board.dto.BoardPostCreateRequest;
import com.franchise.backend.board.dto.BoardPostDetailResponse;
import com.franchise.backend.board.dto.BoardPostListResponse;
import com.franchise.backend.board.dto.BoardPostUpdateRequest;
import com.franchise.backend.board.entity.Post;
import com.franchise.backend.board.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LeaderBoardService {

    private final PostRepository postRepository;

    public LeaderBoardService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    // 전체 목록 조회
    public List<BoardPostListResponse> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByIsPinnedDescCreatedAtDesc();
        return toDtoList(posts);
    }

    // 검색 조회
    public List<BoardPostListResponse> searchPosts(String keyword) {
        List<Post> posts = postRepository
                .findByTitleContainingIgnoreCaseOrCreatedByUserIdOrderByIsPinnedDescCreatedAtDesc(
                        keyword, -1L);
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
                        p.getIsPinned()))
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
                post.getIsPinned());
    }

    // ADMIN 전용: 게시글 등록
    @Transactional
    public Long createPost(BoardPostCreateRequest req, Long adminUserId) {
        if (req == null) throw new IllegalArgumentException("요청값이 비어있습니다.");
        if (isBlank(req.getTitle())) throw new IllegalArgumentException("제목은 필수입니다.");
        if (isBlank(req.getContent())) throw new IllegalArgumentException("내용은 필수입니다.");

        Post post = new Post(req.getTitle(), req.getContent(), adminUserId);

        // 중요공지 옵션
        if (Boolean.TRUE.equals(req.getIsPinned())) {
            post.pin();
        }

        return postRepository.save(post).getId();
    }

    // ADMIN 전용: 게시글 수정
    @Transactional
    public Long updatePost(Long postId, BoardPostUpdateRequest req, Long adminUserId) {
        if (req == null) throw new IllegalArgumentException("요청값이 비어있습니다.");

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + postId));

        // title/content는 화면에서 필수일 가능성이 높아서 필수로 막는 편 추천
        if (isBlank(req.getTitle())) throw new IllegalArgumentException("제목은 필수입니다.");
        if (isBlank(req.getContent())) throw new IllegalArgumentException("내용은 필수입니다.");

        // 수정자 + 고정여부 반영
        post.update(req.getTitle(), req.getContent(), adminUserId, req.getIsPinned());

        return post.getId();
    }

    // ADMIN 전용: 게시글 삭제
    @Transactional
    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new IllegalArgumentException("게시글이 존재하지 않습니다. id=" + postId);
        }
        postRepository.deleteById(postId);
    }


    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
