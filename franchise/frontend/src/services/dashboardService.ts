import api from '@/lib/api';
import { DailyBriefing } from '@/types';
// mock data removed

export const DashboardService = {
    // 1. Team Leader Dashboard Summary (Manager)
    getManagerDashboard: async (): Promise<DailyBriefing> => {
        try {
            const response = await api.get('/dashboard/summary');
            // Expected backend response: { success: true, data: DailyBriefing }
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch manager dashboard:', error);
            throw error;
        }
    },

    // 2. Supervisor Dashboard Summary (SV)
    getSvDashboard: async (loginId: string): Promise<DailyBriefing> => {
        try {
            const response = await api.get(`/dashboard/supervisor/summary?loginId=${loginId}`);
            // Expected backend response: { success: true, data: DailyBriefing }
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch SV dashboard:', error);
            throw error;
        }
    }
};
