import api from '@/lib/api';

// Backend DTO Types
export interface PosKpiDashboardResponse {
    storeId: number;
    storeName: string;
    storeState: 'NORMAL' | 'WATCHLIST' | 'RISK';
    periodType: 'WEEK' | 'MONTH';
    summary: {
        totalSales: number;
        totalSalesRate: number;
        totalOrders: number;
        totalOrdersRate: number;
        aov: number;
        aovRate: number;
    };
    statusSummary: {
        title: string;
        detail: string;
        level: 'INFO' | 'WARN' | 'ALERT';
    };
    salesTrend: Array<{
        label: string;
        value: number;
    }>;
    salesChangeTrend: Array<{
        label: string;
        value: number | null;
    }>;
    ordersAndAovTrend: Array<{
        label: string;
        orders: number;
        aov: number;
    }>;
    baseline?: {
        salesBaseline: number;
        ordersBaseline: number;
        aovBaseline: number;
        salesWarnRate: number;
    };
}

export const PosService = {
    getDashboard: async (
        storeId: number,
        periodType: 'WEEK' | 'MONTH' = 'WEEK',
        limit: number = 12
    ): Promise<PosKpiDashboardResponse | null> => {

        try {
            const response = await api.get(`/stores/${storeId}/pos/kpi`, {
                params: { periodType, limit, baseline: true }
            });
            return response.data.data;
        } catch (error) {
            console.error('Failed to fetch POS dashboard:', error);
            return null;
        }
    }
};
