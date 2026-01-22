import { BaselineConfig } from '@/types';

const STORAGE_KEY = 'fms_policy_baseline';

export const PolicyService = {
    init: () => {
        // No init needed for now if we just rely on default
    },

    getBaseline: (): BaselineConfig => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) return JSON.parse(data);
        }

        // Default Mock Baseline
        return {
            target: 'ALL',
            metric: 'REVENUE',
            standardValue: 800000, // 800k KRW daily
            allowedDeviation: 30, // 30%
            consecutiveDays: 3
        };
    },

    saveBaseline: (config: BaselineConfig) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
        }
    }
};
