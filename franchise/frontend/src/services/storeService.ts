import api from '@/lib/api';
import {
    StoreSearchRequest,
    Store,
    StoreDetail,
    StoreUpdateRequest
} from '@/types';

// [권역 코드 매핑 로직]
// 백엔드에서 넘어오는 region_code 앞자리를 보고 한글명으로 변환
export const getRegionName = (code: string): string => {
    if (!code) return '';
    const upperCode = code.toUpperCase();

    if (upperCode.startsWith('SEOUL') || upperCode.startsWith('GYEONGGI') || upperCode.startsWith('INCHEON') || upperCode.startsWith('GYEONGGL')) {
        return '서울/경기';
    }
    if (upperCode.startsWith('BUSAN') || upperCode.startsWith('ULSAN') || upperCode.startsWith('GYEONGNAM')) {
        return '부산/경남';
    }
    if (upperCode.startsWith('DAEGU') || upperCode.startsWith('GYEONGBUK') || upperCode.startsWith('대구') || upperCode.startsWith('경북')) {
        return '대구/경북';
    }
    if (upperCode.startsWith('DAEJEON') || upperCode.startsWith('CHUNG') || upperCode.startsWith('GANGWON') || upperCode.startsWith('SEJONG') || upperCode.startsWith('대전') || upperCode.startsWith('충청') || upperCode.startsWith('강원')) {
        return '대전/충청';
    }
    if (upperCode.startsWith('GWANGJU') || upperCode.startsWith('JEONLA') || upperCode.startsWith('JEOLLA') || upperCode.startsWith('JEON') || upperCode.startsWith('광주') || upperCode.startsWith('전라')) {
        return '광주/전라';
    }
    if (upperCode.startsWith('JEJU') || upperCode.startsWith('제주')) {
        return '제주';
    }

    return code; // 매칭 안되면 원본 코드 반환
};

// 프론트엔드 한글 지역명 -> 백엔드용 코드 변환
export const getBackendRegionCode = (name: string): string => {
    switch (name) {
        case '서울/경기': return 'SEOUL_GYEONGGI';
        case '부산/경남': return 'BUSAN_GYEONGNAM';
        case '대구/경북':
        case '대구/울산/경북': return 'DAEGU_ULSAN_GYEONGBUK';
        case '대전/충청':
        case '강원/충청': return 'GANGWON_CHUNGCHEONG';
        case '광주/전라':
        case '전라/광주': return 'JEONLA_GWANGJU';
        case '제주': return 'JEJU';
        default: return name;
    }
};

// 백엔드 데이터 -> 프론트엔드 모델 변환
const mapBackendStoreToFrontend = (backendStore: any): Store => {
    // regionCode가 없으면 region 필드를 사용 (Mock 데이터 호환성 등)
    const regionCode = backendStore.regionCode || backendStore.region || '';

    return {
        id: backendStore.storeId || backendStore.id, // Mock 데이터 호환
        name: backendStore.storeName || backendStore.name,
        state: backendStore.state || backendStore.currentState || 'NORMAL',

        // [중요] 여기서 변환 로직 적용
        region: getRegionName(regionCode),

        supervisor: backendStore.supervisor || '',
        qscScore: backendStore.qscScore || 0,
        lastInspectionDate: backendStore.lastInspectionDate || null,
        description: '',
        manager: '',
        storePhone: '',
        regionCode: regionCode,
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
    getStores: async (params?: StoreSearchRequest): Promise<Store[]> => {
        const response = await api.get('/stores', { params: params || {} });
        const backendStores = response.data.data || response.data || [];
        return backendStores.map(mapBackendStoreToFrontend);
    },

    getStoresBySv: async (params?: StoreSearchRequest): Promise<Store[]> => {
        try {
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

    getStore: async (storeId: number | string): Promise<StoreDetail | null> => {
        return StoreService.getStoreDetail(storeId);
    },

    getStoreDetail: async (storeId: number | string): Promise<StoreDetail | null> => {

        try {
            const response = await api.get(`/stores/${storeId}`);
            const backendStore = response.data.data || response.data;
            const regionCode = backendStore.region || backendStore.regionCode || '';

            return {
                id: backendStore.storeId,
                name: backendStore.storeName,
                state: backendStore.currentState,
                region: getRegionName(regionCode), // 상세 조회 시 변환
                description: '',
                manager: backendStore.supervisorLoginId || '',
                storePhone: backendStore.ownerPhone || '',
                supervisor: backendStore.supervisorLoginId || '',
                qscScore: backendStore.qscScore || 0,
                lastInspectionDate: null,
                regionCode: regionCode,
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
        try {
            const response = await api.get(`/stores/${storeId}/events`, { params: { limit } });
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Failed to fetch store events:', error);
            return [];
        }
    },

    updateStore: async (storeId: number | string, data: StoreUpdateRequest): Promise<StoreDetail | null> => {
        try {
            const response = await api.patch(`/stores/${storeId}`, data);
            return await StoreService.getStoreDetail(storeId);
        } catch (error) {
            console.error('Failed to update store:', error);
            return null;
        }
    },

    addStore: async (formData: any): Promise<boolean> => {
        try {
            // Map frontend formData to backend StoreCreateRequest format
            const data = {
                storeName: formData.name,
                regionCode: getBackendRegionCode(formData.regionCode),
                address: formData.address,
                tradeAreaType: formData.tradeAreaType,
                // Format date as ISO with time (e.g., 2026-02-03T00:00:00)
                openPlannedAt: formData.openedAt ? `${formData.openedAt}T00:00:00` : null,
                ownerName: formData.ownerName,
                ownerPhone: formData.ownerPhone,
                supervisorLoginId: formData.currentSupervisorId,
                contractType: formData.contractType,
                contractEndDate: formData.contractEndAt || null
            };

            // api instance handles JWT (Bearer token) via interceptors (using 'accessToken' key)
            await api.post('/stores', data);
            return true;
        } catch (error: any) {
            console.error('Failed to add store:', error?.response?.data || error.message);
            return false;
        }
    },

    getSupervisorsByRegion: async (region: string): Promise<any[]> => {
        try {
            const response = await api.get('/users/supervisors', {
                params: { region }
            });
            return response.data.data || response.data || [];
        } catch (error) {
            console.error('Failed to fetch supervisors:', error);
            return [];
        }
    }
};