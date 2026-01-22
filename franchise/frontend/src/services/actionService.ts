import { ActionItem } from '@/types';
import { MOCK_ACTIONS } from '@/lib/mock/mockActionData';

const STORAGE_KEY = 'fms_actions';

export const ActionService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ACTIONS));
        }
    },

    getActions: (): ActionItem[] => {
        if (typeof window === 'undefined') return MOCK_ACTIONS;
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : MOCK_ACTIONS;
    },

    getAction: (id: string): ActionItem | undefined => {
        const actions = ActionService.getActions();
        return actions.find(a => a.id === id);
    },

    saveAction: (action: ActionItem) => {
        const actions = ActionService.getActions();
        const index = actions.findIndex(a => a.id === action.id);
        if (index !== -1) {
            actions[index] = action;
        } else {
            actions.unshift(action);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(actions));
    }
};
