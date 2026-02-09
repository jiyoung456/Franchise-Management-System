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
    },

    // 3. Admin Dashboard Summary
    getAdminSummary: async (): Promise<any> => {
        try {
            const response = await api.get('/dashboard/admin/summary');
            console.log('Admin Summary Response:', response.data);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch admin summary:', error);
            throw error;
        }
    },
    // 4. SV 위험 점포 TOP
    getSvRiskStores: async (limit: number = 3) => {
        try {
            const response = await api.get(`/stores/supervisor?sort=risk&limit=${limit}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch SV risk stores:', error);
            throw error;
        }


    },
    getRiskReport: async (storeId: number) => {
        try {
            const response = await api.get(`/risk/report/${storeId}`);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch risk report:', error);
            throw error;
        }
    }




};
