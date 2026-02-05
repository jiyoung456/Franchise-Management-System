package com.franchise.backend.briefing.service;

import com.franchise.backend.agentApiConfig.agentController.AgentController;
import com.franchise.backend.briefing.dto.BriefingRequest;
import com.franchise.backend.briefing.dto.BriefingResponse;
import com.franchise.backend.briefing.entity.AgentBriefings;
import com.franchise.backend.briefing.repository.AgentBriefingsRepository;
import org.springframework.stereotype.Service;


@Service
public class BriefingService {

    private final AgentController agentController;
    private final AgentBriefingsRepository agentBriefingsRepository;

    public BriefingService(AgentController agentController,
                           AgentBriefingsRepository agentBriefingsRepository) {
        this.agentController = agentController;
        this.agentBriefingsRepository = agentBriefingsRepository;
    }

    public void generateBriefing(BriefingRequest request) {
        BriefingResponse response = agentController.callBriefingAgent(request);

        AgentBriefings entity =
                new AgentBriefings(request, response);

        agentBriefingsRepository.save(entity);

    }

}
