// Minimal mock service for the dashboard demo. Replace with real API calls.
import type { UrgentInsight, StoreRiskSummary, SupervisorSummary } from "@/types/dashboard"

export async function fetchDashboardMock(): Promise<{ insights: UrgentInsight[]; stores: StoreRiskSummary[]; supervisors: SupervisorSummary[] }> {
  // lightweight dynamic import of mock data so it can be swapped with real axios calls later
  const mod = await import("@/hooks/useMockDashboard")
  // the hook exports default and named, but we only need static data; call the hook replacement
  // instantiate the same sample payload used in the hook
  const insights = [
    { id: "i1", headline: "3 stores in Gangnam area show hygiene decline", affectedStoreIds: ["st1", "st2"], confidence: 0.91, details: ["Hygiene score -12% week over week", "2 negative customer feedbacks"] }
  ]

  const supervisors = [
    { id: "s1", name: "Lee Min", avatarUrl: "", riskyStoresCount: 3, pendingActionsCount: 2 },
    { id: "s2", name: "Kim Hana", avatarUrl: "", riskyStoresCount: 1, pendingActionsCount: 0 },
    { id: "s3", name: "Park Jun", avatarUrl: "", riskyStoresCount: 0, pendingActionsCount: 1 }
  ]

  const stores = [
    { id: "st1", name: "Gangnam Branch A", region: "Gangnam", riskLevel: "critical", aiRecommendation: "Immediate hygiene inspection; deep clean recommended.", assignedSupervisorId: "s1", lastUpdated: new Date().toISOString() },
    { id: "st2", name: "Gangnam Branch B", region: "Gangnam", riskLevel: "high", aiRecommendation: "Schedule hygiene retraining and spot checks.", assignedSupervisorId: "s1", lastUpdated: new Date().toISOString() },
    { id: "st3", name: "Mapo Branch", region: "Mapo", riskLevel: "medium", aiRecommendation: "Monitor weekly hygiene score.", assignedSupervisorId: "s2", lastUpdated: new Date().toISOString() }
  ]

  return { insights, stores, supervisors }
}

export default { fetchDashboardMock }
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
    }
};
