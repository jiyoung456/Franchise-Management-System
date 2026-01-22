import { Store } from '@/types';
import { MOCK_STORES } from '@/lib/mock/mockData';

const STORAGE_KEY = 'fms_stores';

export const StoreService = {
    init: () => {
        if (typeof window === 'undefined') return;
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_STORES));
        }
    },

    getStores: (): Store[] => {
        if (typeof window === 'undefined') return MOCK_STORES;
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : MOCK_STORES;
    },

    getStore: (id: string): Store | undefined => {
        const stores = StoreService.getStores();
        return stores.find(s => s.id === id);
    },

    addStore: (newStore: Store) => {
        const stores = StoreService.getStores();
        stores.push(newStore);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
    },

    updateStore: (updatedStore: Store) => {
        const stores = StoreService.getStores();
        const index = stores.findIndex(s => s.id === updatedStore.id);
        if (index !== -1) {
            stores[index] = updatedStore;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stores));
        }
    },

    getStoresBySv: (svId: string): Store[] => {
        const stores = StoreService.getStores();
        return stores.filter(s => s.currentSupervisorId === svId);
    }
};
