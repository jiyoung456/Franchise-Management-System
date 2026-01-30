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
        assignee: backendAction.assignedToUserId?.toString() || '',
        assigneeName: backendAction.assignedToUserName,
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
        try {
            const response = await api.get(`/actions/${actionId}/effect`);
            return response.data.data || response.data;
        } catch (error) {
            console.error(`Failed to fetch action effect ${actionId}:`, error);
            return null;
        }
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
