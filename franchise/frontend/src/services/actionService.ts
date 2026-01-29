import api from '@/lib/api';
import { ActionItem } from '@/types';

const STORAGE_KEY = 'fms_actions';

// Map backend ActionListResponse to frontend ActionItem
const mapBackendActionToFrontend = (backendAction: any): ActionItem => {
    return {
        id: backendAction.actionId?.toString() || '',
        storeId: backendAction.storeId?.toString() || '',
        title: backendAction.title || '',
        type: backendAction.actionType || 'VISIT',
        priority: backendAction.priority || 'MEDIUM',
        status: backendAction.status || 'OPEN',
        dueDate: backendAction.dueDate || '',
        assignee: backendAction.assignedToUserId?.toString() || '',
        linkedEventId: backendAction.relatedEventId?.toString(),
        description: backendAction.description || ''
    };
};

export const ActionService = {
    init: () => {
    },

    getActions: async (): Promise<ActionItem[]> => {

        try {
            const response = await api.get('/actions');
            const backendActions = response.data || [];
            return backendActions.map(mapBackendActionToFrontend);
        } catch (error) {
            console.error('Failed to fetch actions:', error);
            return [];
        }
    },

    getAction: async (id: string): Promise<ActionItem | undefined> => {

        try {
            const response = await api.get(`/actions/${id}`);
            return mapBackendActionToFrontend(response.data);
        } catch (error) {
            console.error(`Failed to fetch action ${id}:`, error);
            return undefined;
        }
    },

    getActionEffect: async (actionId: string) => {

        try {
            const response = await api.get(`/actions/${actionId}/effect`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch action effect ${actionId}:`, error);
            return null;
        }
    },

    saveAction: async (action: ActionItem) => {
        // Backend update would go here with PUT /api/actions/{id}
    }
};
