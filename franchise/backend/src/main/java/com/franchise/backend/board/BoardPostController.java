package com.franchise.backend.board;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/board-posts")
public class BoardPostController {

    private final BoardPostService boardPostService;

    @GetMapping
    public List<BoardPost> list() {
        return boardPostService.list();
    }
}
