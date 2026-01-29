import api from '@/lib/api';
import { DailyBriefing, ManagerDashboardSummary, SupervisorDashboardSummary } from '@/types';
// mock data removed

export const DashboardService = {
    // 1. Team Leader Dashboard Summary (Manager)
    getManagerDashboard: async (): Promise<ManagerDashboardSummary> => {
        try {
            const response = await api.get('/dashboard/summary');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch manager dashboard:', error);
            throw error;
        }
    },

    // 2. Supervisor Dashboard Summary (SV)
    getSvDashboard: async (loginId: string): Promise<SupervisorDashboardSummary> => {
        try {
            const response = await api.get(`/dashboard/supervisor/summary?loginId=${loginId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch SV dashboard:', error);
            throw error;
        }
    }
};
