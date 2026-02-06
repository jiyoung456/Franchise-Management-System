package com.franchise.backend.board.controller;

import com.franchise.backend.board.dto.BoardPostCreateRequest;
import com.franchise.backend.board.dto.BoardPostDetailResponse;
import com.franchise.backend.board.dto.BoardPostListResponse;
import com.franchise.backend.board.dto.BoardPostUpdateRequest;
import com.franchise.backend.board.service.LeaderBoardService;
import com.franchise.backend.user.entity.Role;
import com.franchise.backend.user.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final LeaderBoardService leaderBoardService;

    public BoardController(LeaderBoardService leaderBoardService) {
        this.leaderBoardService = leaderBoardService;
    }

    @GetMapping("/posts")
    public List<BoardPostListResponse> getPosts(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return leaderBoardService.getAllPosts();
        }
        return leaderBoardService.searchPosts(keyword);
    }

    @GetMapping("/posts/{postId}")
    public BoardPostDetailResponse getPostDetail(@PathVariable Long postId) {
        return leaderBoardService.getPostDetail(postId);
    }

    // ADMIN 전용: 게시글 등록
    @PostMapping("/posts")
    public Long createPost(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody BoardPostCreateRequest request
    ) {
        requireAdmin(principal);
        return leaderBoardService.createPost(request, principal.getUserId());
    }

    // ADMIN 전용: 게시글 수정
    @PatchMapping("/posts/{postId}")
    public Long updatePost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long postId,
            @RequestBody BoardPostUpdateRequest request
    ) {
        requireAdmin(principal);
        return leaderBoardService.updatePost(postId, request, principal.getUserId());
    }

    private void requireAdmin(UserPrincipal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: login required");
        }
        if (principal.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: ADMIN only");
        }
    }

    // ADMIN 전용: 게시글 삭제
    @DeleteMapping("/posts/{postId}")
    public void deletePost(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long postId
    ) {
        requireAdmin(principal);
        leaderBoardService.deletePost(postId);
    }

}
