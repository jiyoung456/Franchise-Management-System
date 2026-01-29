import api, { USE_MOCK_API } from '@/lib/api';
import {
    StoreSearchRequest,
    Store,
    StoreDetail,
    StoreUpdateRequest
} from '@/types';
import { MOCK_STORES } from '@/lib/mock/mockData';

// ... mapBackendStoreToFrontend 함수 (기존과 동일) ...
const mapBackendStoreToFrontend = (backendStore: any): Store => {
    return {
        id: backendStore.storeId,
        name: backendStore.storeName,
        state: backendStore.state || 'NORMAL',
        region: backendStore.region || '',
        supervisor: backendStore.supervisor || '',
        qscScore: backendStore.qscScore || 0,
        lastInspectionDate: backendStore.lastInspectionDate || null,
        description: '',
        manager: '',
        storePhone: '',
        regionCode: backendStore.region || '',
        currentSupervisorId: '',
        operationStatus: 'OPEN',
        currentState: backendStore.state || 'NORMAL',
        currentStateScore: backendStore.qscScore || 0,
        openedAt: '',
        statusHistory: [],
        ownerName: '',
        ownerPhone: '',
        address: '',
        contractType: '',
        contractEndAt: ''
    };
};

export const StoreService = {
    // ... getStores (기존 유지) ...
    getStores: async (params?: StoreSearchRequest): Promise<Store[]> => {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 500));
            let filtered = [...MOCK_STORES];
            if (params?.keyword) {
                const key = params.keyword.toLowerCase();
                filtered = filtered.filter(s =>
                    s.name.includes(key) ||
                    s.region.includes(key) ||
                    (s.supervisor && s.supervisor.includes(key))
                );
            }
            return filtered;
        }

        const response = await api.get('/stores', { params: params || {} });
        const backendStores = response.data.data || response.data || [];
        return backendStores.map(mapBackendStoreToFrontend);
    },

    // [수정된 부분] Supervisor 전용 목록 조회
    getStoresBySv: async (params?: StoreSearchRequest): Promise<Store[]> => {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_STORES.filter(s => [1, 4, 12].includes(s.id));
        }

        try {
            // [Fix] params가 객체인지 확인하고, 안전하게 config 객체 생성
            // 만약 params가 문자열(레거시 호출)로 들어오면 무시하고 빈 객체 사용
            const safeParams = (typeof params === 'object' && params !== null) ? params : {};

            const response = await api.get('/stores/supervisor', { 
                params: safeParams 
            });
            
            const backendStores = response.data.data || response.data || [];
            return backendStores.map(mapBackendStoreToFrontend);
        } catch (error) {
            console.error('Failed to fetch sv stores:', error);
            return [];
        }
    },

    // ... getStore, getStoreDetail, getStoreEvents, updateStore, addStore (기존 유지) ...
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
            const response = await api.get(`/stores/${storeId}`);
            const backendStore = response.data.data || response.data;
            return {
                id: backendStore.storeId,
                name: backendStore.storeName,
                state: backendStore.currentState,
                region: backendStore.regionCode,
                description: '',
                manager: backendStore.supervisorLoginId || '',
                storePhone: backendStore.ownerPhone || '',
                supervisor: backendStore.supervisorLoginId || '',
                qscScore: backendStore.qscScore || 0,
                lastInspectionDate: null,
                regionCode: backendStore.regionCode,
                currentSupervisorId: backendStore.supervisorLoginId || '',
                operationStatus: backendStore.storeOperationStatus,
                currentState: backendStore.currentState,
                currentStateScore: backendStore.currentStateScore || 0,
                openedAt: backendStore.openedDate || '',
                statusHistory: [],
                ownerName: backendStore.ownerName || '',
                ownerPhone: backendStore.ownerPhone || '',
                address: backendStore.address || '',
                contractType: backendStore.contractType || '',
                contractEndAt: backendStore.contractEndDate || ''
            };
        } catch (error) {
            console.error('Failed to fetch store detail:', error);
            return null;
        }
    },

    getStoreEvents: async (storeId: number | string, limit: number = 20): Promise<any[]> => {
        if (USE_MOCK_API) {
            return [];
        }
        try {
            const response = await api.get(`/stores/${storeId}/events`, { params: { limit } });
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Failed to fetch store events:', error);
            return [];
        }
    },

    updateStore: async (storeId: number | string, data: StoreUpdateRequest): Promise<StoreDetail | null> => {
        if (USE_MOCK_API) {
            const current = await StoreService.getStoreDetail(storeId);
            return current ? { ...current, ...data } as StoreDetail : null;
        }
        try {
            const response = await api.patch(`/stores/${storeId}`, data);
            const backendStore = response.data.data || response.data;
            return {
                id: backendStore.storeId,
                name: backendStore.storeName,
                state: backendStore.currentState,
                region: backendStore.regionCode,
                description: '',
                manager: backendStore.supervisorLoginId || '',
                storePhone: backendStore.ownerPhone || '',
                supervisor: backendStore.supervisorLoginId || '',
                qscScore: backendStore.qscScore || 0,
                lastInspectionDate: null,
                regionCode: backendStore.regionCode,
                currentSupervisorId: backendStore.supervisorLoginId || '',
                operationStatus: backendStore.storeOperationStatus,
                currentState: backendStore.currentState,
                currentStateScore: backendStore.currentStateScore || 0,
                openedAt: backendStore.openedDate || '',
                statusHistory: [],
                ownerName: backendStore.ownerName || '',
                ownerPhone: backendStore.ownerPhone || '',
                address: backendStore.address || '',
                contractType: backendStore.contractType || '',
                contractEndAt: backendStore.contractEndDate || ''
            };
        } catch (error) {
            console.error('Failed to update store:', error);
            return null;
        }
    },

    addStore: async (data: any): Promise<boolean> => {
        if (USE_MOCK_API) {
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