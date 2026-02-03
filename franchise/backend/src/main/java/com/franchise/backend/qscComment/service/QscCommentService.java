package com.franchise.backend.qscComment.service;

import com.franchise.backend.agentApiConfig.agentController.AgentController;
import com.franchise.backend.qscComment.dto.QscCommentRequest;
import com.franchise.backend.qscComment.dto.QscCommentResponse;
import com.franchise.backend.qscComment.entity.QscCommentAnalysis;
import com.franchise.backend.qscComment.repository.QscCommentAnalysisRepository;
import org.springframework.stereotype.Service;

@Service
public class QscCommentService {

    private final AgentController agentController;
    private final QscCommentAnalysisRepository qscCommentAnalysisRepository;

    public QscCommentService(AgentController agentController,
                             QscCommentAnalysisRepository qscCommentAnalysisRepository) {
        this.agentController = agentController;
        this.qscCommentAnalysisRepository = qscCommentAnalysisRepository;
    }

    public void generateQscCommentAnalyze(QscCommentRequest request) {
         QscCommentResponse response = agentController.callQscCommentAgent(request);

        QscCommentAnalysis entity =
                new QscCommentAnalysis(response, request);

        qscCommentAnalysisRepository.save(entity);

    }
}
