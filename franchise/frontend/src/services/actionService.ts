import api, { USE_MOCK_API } from '@/lib/api';
import { ActionItem } from '@/types';
import { MOCK_ACTIONS } from '@/lib/mock/mockActionData';

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
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACTIONS));
        }
    },

    getActions: async (): Promise<ActionItem[]> => {
        if (USE_MOCK_API) {
            if (typeof window === 'undefined') return MOCK_ACTIONS;
            const json = localStorage.getItem(STORAGE_KEY);
            return json ? JSON.parse(json) : MOCK_ACTIONS;
        }

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
        if (USE_MOCK_API) {
            const actions = await ActionService.getActions();
            return actions.find(a => a.id === id);
        }

        try {
            const response = await api.get(`/actions/${id}`);
            return mapBackendActionToFrontend(response.data);
        } catch (error) {
            console.error(`Failed to fetch action ${id}:`, error);
            return undefined;
        }
    },

    getActionEffect: async (actionId: string) => {
        if (USE_MOCK_API) {
            // Return mock effect data
            return null;
        }

        try {
            const response = await api.get(`/actions/${actionId}/effect`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch action effect ${actionId}:`, error);
            return null;
        }
    },

    saveAction: async (action: ActionItem) => {
        if (USE_MOCK_API) {
            const actions = await ActionService.getActions();
            const index = actions.findIndex(a => a.id === action.id);
            if (index !== -1) {
                actions[index] = action;
            } else {
                actions.unshift(action);
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
        }
        // Backend update would go here with PUT /api/actions/{id}
    }
};
