package com.franchise.backend.agentApiConfig.agentController;

import com.franchise.backend.agentApiConfig.fastApiClient.FastApiClient;
import com.franchise.backend.briefing.dto.BriefingRequest;
import com.franchise.backend.briefing.dto.BriefingResponse;
import com.franchise.backend.qscComment.dto.CommentRequest;
import com.franchise.backend.qscComment.dto.CommentResponse;
import org.springframework.stereotype.Component;

@Component
public class AgentController {

    private final FastApiClient fastApiClient;

    public AgentController(FastApiClient fastApiClient) {
        this.fastApiClient = fastApiClient;
    }

    public BriefingResponse callBriefingAgent(BriefingRequest request){
        return fastApiClient.post(
                "agent/briefing",
                request,
                BriefingResponse.class
        );
    }

    public CommentResponse callCommentAgent(CommentRequest request) {
        return fastApiClient.post(
                "agent/comment",
                request,
                CommentResponse.class
        );
    }
}
