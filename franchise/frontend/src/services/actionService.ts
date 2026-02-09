import api from '@/lib/api';
import { ActionItem } from '@/types';

export interface ActionCreateRequest {
    storeId: number;
    title: string;
    description: string;
    actionType: string;
    priority: string;
    dueDate: string;
    assignedToUserId: number;
    relatedEventId?: number;
}

export interface ActionUpdateRequest {
    title?: string;
    description?: string;
    actionType?: string;
    priority?: string;
    dueDate?: string;
    assignedToUserId?: number;
    status?: string;
}

export interface ActionExecutionSaveRequest {
    performedAt: string;
    resultComment: string;
    attachments: { photoUrl: string; photoName: string }[];
    userId: number;
}

const STORAGE_KEY = 'fms_actions';

// Map backend ActionListResponse to frontend ActionItem
const mapBackendActionToFrontend = (backendAction: any): ActionItem => {
    if (!backendAction) return {} as ActionItem;
    return {
        id: backendAction.actionId?.toString() || backendAction.id?.toString() || '',
        storeId: backendAction.storeId?.toString() || '',
        storeName: backendAction.storeName,
        title: backendAction.title || '',
        type: backendAction.actionType || 'VISIT',
        priority: backendAction.priority || 'MEDIUM',
        status: backendAction.status || 'OPEN',
        dueDate: backendAction.dueDate || '',
        assignee: backendAction.assignedToUserId?.toString() || backendAction.assignedToUser?.id?.toString() || '',
        assigneeName: backendAction.assignedToUserName || backendAction.assignedToUser?.name || backendAction.supervisorName || '',
        linkedEventId: backendAction.relatedEventId?.toString(),
        description: backendAction.description || '',
        createdAt: backendAction.createdAt,
        updatedAt: backendAction.updatedAt
    };
};

export const ActionService = {
    init: () => {
    },

    getActions: async (status?: string): Promise<ActionItem[]> => {
        try {
            const params = status ? { status } : {};
            const response = await api.get('/actions', { params });
            // Handle optional ApiResponse wrapping
            const data = response.data.data || response.data || [];
            return Array.isArray(data) ? data.map(mapBackendActionToFrontend) : [];
        } catch (error) {
            console.error('Failed to fetch actions:', error);
            return [];
        }
    },

    getAction: async (id: string): Promise<ActionItem | undefined> => {
        try {
            const response = await api.get(`/actions/${id}`);
            const data = response.data.data || response.data;
            return data ? mapBackendActionToFrontend(data) : undefined;
        } catch (error) {
            console.error(`Failed to fetch action ${id}:`, error);
            return undefined;
        }
    },

    getActionEffect: async (actionId: string) => {
        // [Backend Issue] API returns 500. Using Mock Data until backend is fixed.
        /*
        try {
            const response = await api.get(`/actions/${actionId}/effect`);
            return response.data.data || response.data;
        } catch (error) {
            console.error(`Failed to fetch action effect ${actionId}:`, error);
            return null;
        }
        */
        return {
            actionId: Number(actionId),
            actionTitle: 'QSC 위생 개선 조치',
            targetMetricCode: 'QSC',
            preActionValue: 75.0,
            postActionValue: 88.5,
            improvementRate: 18.0,
            analysisComment: '조치 수행 후 QSC 점수가 유의미하게 상승했습니다.',
            storeSeries: [
                { date: '2025-01-01', value: 74 },
                { date: '2025-01-08', value: 75 },
                { date: '2025-01-15', value: 76 },
                { date: '2025-01-22', value: 85 }, // Action Taken
                { date: '2025-01-29', value: 88 }
            ],
            baselineSeries: [
                { date: '2025-01-01', value: 80 },
                { date: '2025-01-08', value: 80 },
                { date: '2025-01-15', value: 80 },
                { date: '2025-01-22', value: 80 },
                { date: '2025-01-29', value: 80 }
            ]
        };
    },

    createAction: async (data: ActionCreateRequest): Promise<number | null> => {
        try {
            const response = await api.post('/actions', data);
            return response.data.data || response.data;
        } catch (error) {
            console.error('Failed to create action:', error);
            return null;
        }
    },

    updateAction: async (id: string, data: ActionUpdateRequest): Promise<boolean> => {
        try {
            await api.put(`/actions/${id}`, data);
            return true;
        } catch (error) {
            console.error(`Failed to update action ${id}:`, error);
            return false;
        }
    },

    getResultForm: async (id: string) => {
        try {
            const response = await api.get(`/actions/${id}/execution`);
            return response.data.data || response.data;
        } catch (error) {
            console.error(`Failed to fetch result form for action ${id}:`, error);
            return null;
        }
    },

    saveExecution: async (id: string, data: ActionExecutionSaveRequest): Promise<boolean> => {
        try {
            await api.post(`/actions/${id}/execution`, data);
            return true;
        } catch (error) {
            console.error(`Failed to save execution for action ${id}:`, error);
            return false;
        }
    },

    getSummary: async (): Promise<number> => {
        try {
            const response = await api.get('/actions/summary');
            return response.data.data?.inProgressCount || response.data.inProgressCount || 0;
        } catch (error) {
            console.error('Failed to fetch action summary:', error);
            return 0;
        }
    },

    getUserSummary: async (userId: string | number): Promise<number> => {
        try {
            const response = await api.get(`/users/${userId}/actions/summary`);
            return response.data.data?.inProgressCount || response.data.inProgressCount || 0;
        } catch (error) {
            console.error(`Failed to fetch user action summary for ${userId}:`, error);
            return 0;
        }
    }
};
