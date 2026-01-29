import api from '@/lib/api';
import {
    StoreSearchRequest,
    Store,
    StoreDetail,
    StoreUpdateRequest
} from '@/types';

// [권역 코드 매핑 로직]
// 백엔드에서 넘어오는 region_code 앞자리를 보고 한글명으로 변환
const getRegionName = (code: string): string => {
    if (!code) return '';
    const upperCode = code.toUpperCase();

    if (upperCode.startsWith('SEOUL')) return '서울';
    if (upperCode.startsWith('GYEONGGI') || upperCode.startsWith('GYEONGGL')) return '경기'; // 오타 대응
    if (upperCode.startsWith('INCHEON')) return '인천';
    if (upperCode.startsWith('CHUNGNAM')) return '충남';
    if (upperCode.startsWith('CHUNGBUK')) return '충북';
    if (upperCode.startsWith('GANGWON')) return '강원';
    if (upperCode.startsWith('SEJONG')) return '세종';
    if (upperCode.startsWith('BUSAN')) return '부산';
    if (upperCode.startsWith('DAEGU')) return '대구';
    if (upperCode.startsWith('ULSAN')) return '울산';
    if (upperCode.startsWith('GWANGJU')) return '광주';
    if (upperCode.startsWith('JEONNAM')) return '전남';
    if (upperCode.startsWith('JEONBUK')) return '전북';
    if (upperCode.startsWith('JEJU')) return '제주';
    if (upperCode.startsWith('GYEONGNAM')) return '경남';
    if (upperCode.startsWith('GYEONGBUK')) return '경북';

    return code; // 매칭 안되면 원본 코드 반환
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

    addStore: async (data: any): Promise<boolean> => {
        try {
            await api.post('/stores', data);
            return true;
        } catch (error) {
            return false;
        }
    },
};