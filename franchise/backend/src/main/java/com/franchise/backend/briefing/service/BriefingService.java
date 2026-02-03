package com.franchise.backend.briefing.service;

import com.franchise.backend.agentApiConfig.agentController.AgentController;
import com.franchise.backend.briefing.dto.BriefingRequest;
import com.franchise.backend.briefing.dto.BriefingResponse;
import org.springframework.stereotype.Service;


@Service
public class BriefingService {

    private final AgentController agentController;

    public BriefingService(AgentController agentController) {
        this.agentController = agentController;
    }

    public BriefingResponse generateBriefing(BriefingRequest request) {
        return agentController.callBriefingAgent(request);
    }

}
