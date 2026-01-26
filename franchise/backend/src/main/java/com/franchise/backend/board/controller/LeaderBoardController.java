package com.franchise.backend.board.controller;

import com.franchise.backend.board.dto.BoardPostListResponse;
import com.franchise.backend.board.service.LeaderBoardService;
import org.springframework.web.bind.annotation.*;
import com.franchise.backend.board.dto.BoardPostDetailResponse;
import org.springframework.web.bind.annotation.PathVariable;


import java.util.List;

@RestController
@RequestMapping("/api/leader/board")
public class LeaderBoardController {

    private final LeaderBoardService leaderBoardService;

    public LeaderBoardController(LeaderBoardService leaderBoardService) {
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
}
