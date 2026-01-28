import api, { USE_MOCK_API } from '@/lib/api';
import {
    StoreSearchRequest,
    Store,
    StoreDetail,
    StoreEventResponse,
    StoreUpdateRequest,
    ApiResponse
} from '@/types';
import { MOCK_STORES } from '@/lib/mock/mockData';

export const StoreService = {
    // 점포 목록 조회 (Mock)
    getStores: async (params?: StoreSearchRequest): Promise<Store[]> => {
        if (USE_MOCK_API) {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            let filtered = [...MOCK_STORES];
            if (params?.keyword) {
                const key = params.keyword.toLowerCase();
                filtered = filtered.filter(s =>
                    s.name.includes(key) ||
                    s.region.includes(key) ||
                    (s.supervisor && s.supervisor.includes(key)) // SV name check
                );
            }
            return filtered;
        }

        const response = await api.get('/stores', { params });
        // Backend returns ApiResponse wrapper: { success: true, data: [...] }
        return response.data.data || response.data || [];
    },

    // Supervisor-specific stores (Mock)
    getStoresBySv: async (svId: string): Promise<Store[]> => {
        if (USE_MOCK_API) {
            // Return fixed dummy stores for ALL SVs
            // IDs: 1(Normal), 4(Risk), 11(Normal), 12(Watchlist)
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_STORES.filter(s => [1, 4, 12].includes(s.id));
        }

        const response = await api.get(`/stores?supervisorId=${svId}`);
        // Backend returns ApiResponse wrapper: { success: true, data: [...] }
        return response.data.data || response.data || [];
    },

    // 점포 상세 조회
    getStore: async (storeId: number | string): Promise<StoreDetail | null> => {
        return StoreService.getStoreDetail(storeId);
    },

    getStoreDetail: async (storeId: number | string): Promise<StoreDetail | null> => {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            const store = MOCK_STORES.find(s => s.id.toString() === storeId.toString());
            return store || null;
        }

        try {
            const response = await api.get<StoreDetail>(`/stores/${storeId}`);
            return response.data;
        } catch (error) {
            return null;
        }
    },

    // 점포 이벤트 목록 조회 (Mock)
    getStoreEvents: async (storeId: number | string): Promise<StoreEventResponse[]> => {
        if (USE_MOCK_API) {
            return []; // Return empty for now or use MOCK_EVENTS if imported
        }

        const response = await api.get<StoreEventResponse[]>(`/stores/${storeId}/events`);
        return response.data;
    },

    // 점포 정보 수정 (Mock)
    updateStore: async (storeId: number | string, data: StoreUpdateRequest): Promise<StoreDetail | null> => {
        if (USE_MOCK_API) {
            console.log('Mock Update:', storeId, data);
            const current = await StoreService.getStoreDetail(storeId);
            return current ? { ...current, ...data } as StoreDetail : null;
        }

        const response = await api.put<StoreDetail>(`/stores/${storeId}`, data);
        return response.data;
    },

    // 점포 등록 (Mock)
    addStore: async (data: any): Promise<boolean> => {
        if (USE_MOCK_API) {
            console.log('Mock Create:', data);
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }

        try {
            await api.post('/stores', data);
            return true;
        } catch (error) {
            return false;
        }
    },
};
