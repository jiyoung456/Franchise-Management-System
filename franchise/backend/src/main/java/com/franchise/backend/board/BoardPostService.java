package com.franchise.backend.board;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardPostService {

    private final BoardPostRepository boardPostRepository;

    public List<BoardPost> list() {
        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("createdAt"),
                Sort.Order.desc("postId")
        );
        return boardPostRepository.findAll(sort);
    }
}
