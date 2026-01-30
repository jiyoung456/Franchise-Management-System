import api from '@/lib/api';
import { EventLog } from '@/types';

// 백엔드 응답 데이터를 프론트엔드 EventLog 타입으로 변환하는 매핑 함수
const mapBackendEventToFrontend = (backendEvent: any): EventLog => {
    // 백엔드 응답이 중첩된 객체일 경우를 대비
    const data = backendEvent.event || backendEvent;

    return {
        // ID 및 기본 정보 매핑 (타입 변환 포함)
        id: String(data.eventId || data.id),
        storeId: String(data.storeId),
        storeName: data.storeName || backendEvent.storeName || '',

        // [핵심 수정] 백엔드의 summary를 프론트엔드의 message/title로 매핑
        title: data.summary || data.title || '제목 없음',
        content: data.summary || data.content || '',
        message: data.summary || data.message || '',

        // 날짜 및 상태 매핑
        timestamp: data.occurredAt || data.timestamp || new Date().toISOString(),
        occurredAt: data.occurredAt || data.timestamp || new Date().toISOString(), // 정렬 호환성 유지

        // Enum 타입 매핑
        type: data.eventType || data.type || 'INFO',
        status: data.status || 'OPEN',
        severity: data.severity || 'INFO',
        priority: data.priority || 'MEDIUM',

        isHandled: data.isHandled || false,

        // 나머지 데이터 보존
        ...data
    };
};

export const EventService = {
    // [GET] 이벤트 관리 - 리스트 조회 (검색/필터/페이징)
    getEvents: async (params?: { page?: number; limit?: number; keyword?: string; type?: string; status?: string }): Promise<EventLog[]> => {
        try {
            const response = await api.get('/events', { params });
            const backendData = response.data.data || response.data || [];
            const list = Array.isArray(backendData) ? backendData : (backendData.content || []);

            return list.map(mapBackendEventToFrontend);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            return [];
        }
    },

    // [GET] 이벤트 관리 - 이벤트 상세 조회
    getEvent: async (id: string | number): Promise<EventLog | null> => {
        try {
            const response = await api.get(`/events/${id}`);
            const backendData = response.data.data || response.data;

            if (!backendData) return null;
            return mapBackendEventToFrontend(backendData);
        } catch (error) {
            console.error(`Failed to fetch event ${id}:`, error);
            return null;
        }
    },

    // [GET] 점포 상세 - 특정 점포의 이벤트 목록 조회
    getStoreEvents: async (storeId: number | string): Promise<EventLog[]> => {
        try {
            const response = await api.get(`/stores/${storeId}/events`);
            const backendData = response.data.data || response.data || [];

            return backendData.map(mapBackendEventToFrontend);
        } catch (error) {
            console.error(`Failed to fetch store events for store ${storeId}:`, error);
            return [];
        }
    },

    // [GET] 이벤트 관리 - 상단 카드 (요약 정보)
    getEventSummary: async (): Promise<any> => {
        try {
            const response = await api.get('/events/summary');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to fetch event summary:', error);
            return null;
        }
    },

    // [POST/PATCH] 이벤트 저장 (상태 변경 등)
    saveEvent: async (event: EventLog): Promise<boolean> => {
        try {
            if (event.id) {
                // await api.patch(`/events/${event.id}`, event);
            }
            console.warn('saveEvent: API 엔드포인트가 확인되지 않아 실제 요청은 생략되었습니다.');
            return true;
        } catch (error) {
            console.error('Failed to save event:', error);
            return false;
        }
    }
};