import api from '@/lib/api';

// =========================
// Backend DTO Types (정합)
// =========================

export interface PosKpiDashboardResponse {
    storeId: number;
    storeName: string;
    storeState: 'NORMAL' | 'WATCHLIST' | 'RISK' | null;
    periodType: 'WEEK' | 'MONTH';
    summary: {
        totalSales: number;
        totalSalesRate: number | null;
        totalOrders: number;
        totalOrdersRate: number | null;
        aov: number;
        aovRate: number | null;
    };
    statusSummary: {
        title: string;
        detail: string;
        level: 'INFO' | 'WARN' | 'ALERT';
    };
    salesTrend: Array<{ label: string; value: number }>;
    salesChangeTrend: Array<{ label: string; value: number | null }>;
    ordersAndAovTrend: Array<{ label: string; orders: number; aov: number }>;
    baseline?: {
        salesBaseline: number | null;
        ordersBaseline: number | null;
        aovBaseline: number | null;
        salesWarnRate: number;
    } | null;
}

/**
 * ✅ SV POS 대시보드 (백엔드: PosDashboardResponse)
 * PosDashboardController는 ApiResponse로 감싸지 않고 "그냥 DTO"를 반환함.
 */
export interface SupervisorPosDashboardBackendResponse {
    summary: {
        totalSales: number;
        avgMarginRate: number;
        avgOrderValue: number;
        totalOrders: number;

        salesChangeRate: number | null;
        marginRateChangeRate: number | null;
        aovChangeRate: number | null;
        orderChangeRate: number | null;
    };
    trend: Array<{
        date: string;
        sales: number;
        margin: number;
    }>;
    ranking: {
        top5: Array<{
            storeId: number;
            storeName: string;
            regionCode: string;
            sales: number;
            marginAmount: number;   // ✅ FIX
            marginRate: number;
            growthRate: number;
        }>;
        low5: Array<{
            storeId: number;
            storeName: string;
            regionCode: string;
            sales: number;
            marginAmount: number;   // ✅ FIX
            marginRate: number;
            growthRate: number;
        }>;
    };
    performanceList: Array<{
        storeId: number;
        storeName: string;
        regionCode: string;
        sales: number;
        marginAmount: number;     // ✅ FIX
        marginRate: number;
        growthRate: number;
    }>;
}

export interface SupervisorDashboardResponse {
    summary: {
        totalSales: number;
        totalSalesRate: number | null;
        totalMargin: number;
        marginRate: number;
        marginRateDiff: number | null;
        totalOrders: number;
        totalOrdersRate: number | null;
        aov: number;
        aovRate: number | null;
    };
    chartData: Array<{
        date: string;
        revenue: number;
        margin: number;
    }>;
    ranking: Array<{
        storeId: number;
        storeName: string;
        region: string;
        revenue: number;
        growth: number;
    }>;
    lowRanking: Array<{
        storeId: number;
        storeName: string;
        region: string;
        revenue: number;
        growth: number;
    }>;
    storeList: Array<{
        storeId: number;
        storeName: string;
        region: string;
        revenue: number;
        margin: number;
        marginRate: number;
        growth: number;
    }>;
}

// =========================
// Date helpers
// =========================

function toYmd(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDefaultPeriodStart(periodType: 'WEEK' | 'MONTH'): string {
    // Defaulting to 2025-08-31 to match the backend data range requested by the user.
    return '2025-08-31';
}

/**
 * ✅ 지역 코드(예: SEOUL_01)를 사람이 읽기 쉬운 명칭으로 변환
 */
function formatRegionName(code: string): string {
    if (!code) return '-';
    const upper = code.toUpperCase();

    if (upper.startsWith('SEOUL') || upper.startsWith('GYEONGGI') || upper.startsWith('INCHEON')) {
        return '서울/경기';
    }
    if (upper.startsWith('BUSAN') || upper.startsWith('ULSAN') || upper.startsWith('GYEONGNAM')) {
        return '부산/경남';
    }
    if (upper.startsWith('DAEGU') || upper.startsWith('GYEONGBUK') || upper.startsWith('대구') || upper.startsWith('경북')) {
        return '대구/경북';
    }
    if (upper.startsWith('DAEJEON') || upper.startsWith('CHUNG') || upper.startsWith('GANGWON') || upper.startsWith('SEJONG') || upper.startsWith('대전') || upper.startsWith('충청') || upper.startsWith('강원')) {
        return '강원/충청';
    }
    if (upper.startsWith('GWANGJU') || upper.startsWith('JEONLA') || upper.startsWith('JEOLLA') || upper.startsWith('JEON') || upper.startsWith('광주') || upper.startsWith('전라')) {
        return '광주/전라';
    }
    if (upper.startsWith('JEJU') || upper.startsWith('제주')) {
        return '제주';
    }

    return code; // 매칭되지 않으면 원본 반환
}

// =========================
// Mapping
// =========================

function mapSvBackendToUi(
    backend: SupervisorPosDashboardBackendResponse
): SupervisorDashboardResponse {
    const summary = backend.summary;

    return {
        summary: {
            totalSales: summary?.totalSales ?? 0,
            totalSalesRate: summary?.salesChangeRate ?? 0,
            totalMargin: (summary?.totalSales ?? 0) * (summary?.avgMarginRate ?? 0),
            marginRate: summary?.avgMarginRate ?? 0,
            marginRateDiff: summary?.marginRateChangeRate ?? 0,
            totalOrders: summary?.totalOrders ?? 0,
            totalOrdersRate: summary?.orderChangeRate ?? 0,
            aov: summary?.avgOrderValue ?? 0,
            aovRate: summary?.aovChangeRate ?? 0,
        },
        chartData: (backend.trend ?? []).map((p) => ({
            date: p.date,
            revenue: p.sales,
            margin: p.margin,
        })),
        ranking: (backend.ranking?.top5 ?? []).map((r) => ({
            storeId: r.storeId,
            storeName: r.storeName,
            region: formatRegionName(r.regionCode),
            revenue: r.sales,
            growth: r.growthRate,
        })),
        lowRanking: (backend.ranking?.low5 ?? []).map((r) => ({
            storeId: r.storeId,
            storeName: r.storeName,
            region: formatRegionName(r.regionCode),
            revenue: r.sales,
            growth: r.growthRate,
        })),
        storeList: (backend.performanceList ?? []).map((row) => ({
            storeId: row.storeId,
            storeName: row.storeName,
            region: formatRegionName(row.regionCode),
            revenue: row.sales,
            margin: row.marginAmount, // ✅ FIX
            marginRate: row.marginRate,
            growth: row.growthRate,
        })),
    };
}

// =========================
// Service
// =========================

export const PosService = {
    getDashboard: async (
        storeId: number,
        periodType: 'WEEK' | 'MONTH' = 'WEEK',
        limit: number = 12
    ): Promise<PosKpiDashboardResponse | null> => {
        try {
            const response = await api.get(`/stores/${storeId}/pos/kpi`, {
                params: { periodType, limit, baseline: true },
            });
            return response.data.data as PosKpiDashboardResponse;
        } catch (error) {
            console.error('Failed to fetch POS dashboard:', error);
            return null;
        }
    },

    getSupervisorDashboard: async (
        periodType: 'WEEK' | 'MONTH' = 'MONTH',
        periodStart?: string
    ): Promise<SupervisorDashboardResponse | null> => {
        try {
            const finalPeriodStart =
                periodStart && periodStart.trim().length > 0
                    ? periodStart
                    : getDefaultPeriodStart(periodType);

            const response = await api.get('/pos/supervisor/dashboard', {
                params: { periodType, periodStart: finalPeriodStart },
            });

            const backendDto = response.data as SupervisorPosDashboardBackendResponse;
            return mapSvBackendToUi(backendDto);
        } catch (error: any) {
            console.error('Failed to fetch SV dashboard:', {
                message: error?.message,
                status: error?.response?.status,
                data: error?.response?.data,
            });
            return null;
        }
    },

    getSupervisorStoreDetail: async (
        storeId: number,
        periodType: 'WEEK' | 'MONTH' = 'MONTH',
        periodStart?: string
    ): Promise<any | null> => {
        try {
            const finalPeriodStart =
                periodStart && periodStart.trim().length > 0
                    ? periodStart
                    : getDefaultPeriodStart(periodType);

            const response = await api.get(`/pos/supervisor/stores/${storeId}/dashboard`, {
                params: { periodType, periodStart: finalPeriodStart },
            });

            // Cast to expected Backend DTO
            const backend = response.data as SupervisorPosDashboardBackendResponse;

            // Map to Frontend DTO (PosKpiDashboardResponse) expected by PerformanceClient
            // Note: Some fields like 'orders' or 'aov' in trend might be missing in SV response, defaulting to 0.
            const uiResponse: PosKpiDashboardResponse = {
                storeId: storeId,
                storeName: "", // Available in StoreService call in UI
                storeState: 'NORMAL',
                periodType: periodType,
                summary: {
                    totalSales: backend.summary?.totalSales ?? 0,
                    totalSalesRate: backend.summary?.salesChangeRate ?? 0,
                    totalOrders: backend.summary?.totalOrders ?? 0,
                    totalOrdersRate: backend.summary?.orderChangeRate ?? 0,
                    aov: backend.summary?.avgOrderValue ?? 0,
                    aovRate: backend.summary?.aovChangeRate ?? 0
                },
                statusSummary: { title: "", detail: "", level: "INFO" },
                salesTrend: (backend.trend ?? []).map(t => ({
                    label: t.date,
                    value: t.sales
                })),
                salesChangeTrend: (backend.trend ?? []).map(t => ({
                    label: t.date,
                    value: 0 // Backend doesn't provide change trend history yet
                })),
                ordersAndAovTrend: (backend.trend ?? []).map(t => ({
                    label: t.date,
                    orders: 0, // Backend SV trend DTO lacks orders history
                    aov: 0
                })),
                baseline: null
            };

            return uiResponse;
        } catch (error) {
            console.error('Failed to fetch SV store detail:', error);
            return null;
        }
    },
};
