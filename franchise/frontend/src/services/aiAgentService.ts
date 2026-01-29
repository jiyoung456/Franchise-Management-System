import axios from 'axios';

// AI Agent Base URL (Python FastAPI)
const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL || 'http://localhost:8000';

export interface ManagerBriefingRequest {
    team_leader_id: string;
    risk_stores: any[]; // Using any matching Python Pydantic Model strictly is nice but flexible here
    recent_events: any[];
    open_actions: any[];
}

export interface SVDashboardRequest {
    sv_name: string;
    assigned_stores: any[];
    new_events: any[];
    my_actions: any[];
    recent_analysis?: any[];
}

export interface SvCommentRequest {
    store_name: string;
    sv_comment: string;
}

export const AiAgentService = {
    /**
     * Generate Manager Daily Briefing
     */
    generateManagerBriefing: async (data: ManagerBriefingRequest) => {
        try {
            const response = await axios.post(`${AI_AGENT_URL}/api/ai/briefing/manager`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to generate manager briefing:', error);
            throw error;
        }
    },

    /**
     * Generate SV Dashboard Summary
     */
    generateSVDashboard: async (data: SVDashboardRequest) => {
        try {
            const response = await axios.post(`${AI_AGENT_URL}/api/ai/briefing/supervisor`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to generate SV dashboard:', error);
            throw error;
        }
    },

    /**
     * Analyze SV Comment
     */
    analyzeComment: async (data: SvCommentRequest) => {
        try {
            const response = await axios.post(`${AI_AGENT_URL}/api/ai/analyze/comment`, data);
            return response.data;
        } catch (error) {
            console.error('Failed to analyze comment:', error);
            throw error;
        }
    }
};
