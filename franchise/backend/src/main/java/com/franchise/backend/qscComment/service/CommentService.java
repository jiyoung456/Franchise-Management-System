package com.franchise.backend.qscComment.service;

import com.franchise.backend.agentApiConfig.agentController.AgentController;
import com.franchise.backend.briefing.dto.BriefingRequest;
import com.franchise.backend.briefing.dto.BriefingResponse;
import com.franchise.backend.qscComment.dto.CommentRequest;
import com.franchise.backend.qscComment.dto.CommentResponse;
import org.springframework.stereotype.Service;

@Service
public class CommentService {

    private final AgentController agentController;

    public CommentService(AgentController agentController) {
        this.agentController = agentController;
    }

    public CommentResponse generateCommentAnalyze(CommentRequest request) {
        return agentController.callCommentAgent(request);
    }}
