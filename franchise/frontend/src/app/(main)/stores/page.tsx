import api, { USE_MOCK_API } from '@/lib/api';
import {
    StoreSearchRequest,
    Store,
    StoreDetail,
    StoreUpdateRequest
} from '@/types';
import { MOCK_STORES } from '@/lib/mock/mockData';

// [추가] 권역 코드 -> 한글 변환 맵
const REGION_MAP: Record<string, string> = {
    'SEOUL_GYEONGGI': '서울/경기',
    'GANGWON_CHUNGCHEONG': '강원/충청',
    'JEONLA_GWANGJU': '전라/광주',
    'DAEGU_GYEONGBUK': '대구/경북',
    'BUSAN_GYEONGNAM': '부산/경남',
    'JEJU': '제주'
};

// Map backend StoreListResponse to frontend Store type
const mapBackendStoreToFrontend = (backendStore: any): Store => {
    // 1. 백엔드에서 온 region 값이 코드로 되어있다면 한글로 변환
    // 2. 만약 매핑된 값이 없으면 원본 값 사용, 그것도 없으면 '미지정'
    const regionName = REGION_MAP[backendStore.region] || backendStore.region || '미지정';

    return {
        id: backendStore.storeId,
        name: backendStore.storeName,
        state: backendStore.state || 'NORMAL',
        region: regionName, // [수정] 변환된 한글 권역명 사용
        supervisor: backendStore.supervisor || '',
        qscScore: backendStore.qscScore || 0,
        lastInspectionDate: backendStore.lastInspectionDate || null,
        
        // 상세 필드 기본값
        description: '',
        manager: '',
        storePhone: '',
        regionCode: backendStore.region || '', // [수정] 원본 코드는 regionCode에 저장
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
    // [팀장/관리자용] 점포 목록 조회
    getStores: async (params?: StoreSearchRequest): Promise<Store[]> => {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 500));
            // ... Mock logic (생략 가능)
            return [...MOCK_STORES];
        }

        try {
            // [Fix] TypeError 방지를 위해 params가 없으면 빈 객체 전달
            const response = await api.get('/stores', { params: params || {} });
            const backendStores = response.data.data || response.data || [];
            return backendStores.map(mapBackendStoreToFrontend);
        } catch (error) {
            console.error('Failed to fetch stores:', error);
            return [];
        }
    },

    // [슈퍼바이저용] 내 담당 점포 목록 조회
    getStoresBySv: async (params?: StoreSearchRequest): Promise<Store[]> => {
        if (USE_MOCK_API) {
            await new Promise(resolve => setTimeout(resolve, 300));
            return MOCK_STORES.filter(s => [1, 4, 12].includes(s.id));
        }

        try {
            // [Fix] TypeError 방지 및 params 안전 처리
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
            const response = await api.get(`/stores/${storeId}`);
            const backendStore = response.data.data || response.data;
            
            if (!backendStore) return null;

            // 상세 조회에서도 동일하게 Region 변환 적용
            const regionName = REGION_MAP[backendStore.regionCode] || backendStore.regionCode || '미지정';

            return {
                id: backendStore.storeId,
                name: backendStore.storeName,
                state: backendStore.currentState,
                region: regionName, // [수정]
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

    // ... (나머지 함수들은 기존과 동일하게 유지)
    getStoreEvents: async (storeId: number | string, limit: number = 20): Promise<any[]> => {
        try {
            const response = await api.get(`/stores/${storeId}/events`, { params: { limit } });
            return response.data.data || response.data || [];
        } catch (error) {
            return [];
        }
    },

    updateStore: async (storeId: number | string, data: StoreUpdateRequest): Promise<StoreDetail | null> => {
        try {
            const response = await api.patch(`/stores/${storeId}`, data);
            // 업데이트 후 리턴되는 데이터도 매핑 필요 (생략 가능하나 일관성 위해 권장)
            // 여기서는 간단히 null이 아닌 경우 getStoreDetail을 다시 호출하거나 
            // 위 getStoreDetail 로직을 재사용하는 것이 좋습니다.
            return StoreService.getStoreDetail(storeId); 
        } catch (error) {
            console.error('Failed to update store:', error);
            return null;
        }
    },

    addStore: async (data: any): Promise<boolean> => {
        try {
            await api.post('/stores', data);
            return true;
        } catch (error) {
            return false;
        }
    },
};