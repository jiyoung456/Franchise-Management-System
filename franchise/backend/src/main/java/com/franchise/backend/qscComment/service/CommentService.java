package com.franchise.backend.qscComment.service;

import com.franchise.backend.agentApiConfig.agentController.AgentController;
import com.franchise.backend.qscComment.dto.CommentRequest;
import com.franchise.backend.qscComment.dto.CommentResponse;
import com.franchise.backend.qscComment.entity.QscCommentAnalysis;
import com.franchise.backend.qscComment.repository.QscCommentAnalysisRepository;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final AgentController agentController;
    private final QscCommentAnalysisRepository qscCommentAnalysisRepository;

    public CommentService(AgentController agentController,
                          QscCommentAnalysisRepository qscCommentAnalysisRepository) {
        this.agentController = agentController;
        this.qscCommentAnalysisRepository = qscCommentAnalysisRepository;
    }

    public CommentResponse generateCommentAnalyze(CommentRequest request) {
        return agentController.callCommentAgent(request);

//        QscCommentAnalysis entity =
//                new QscCommentAnalysis();
    }
}
