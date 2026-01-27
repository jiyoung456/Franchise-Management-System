import { User } from '@/types';
import { StorageService } from '@/lib/storage';
import api, { USE_MOCK_API } from '@/lib/api';

export const AuthService = {
    init: async () => {
        if (USE_MOCK_API) {
            StorageService.init();
        }
    },

    getUsers: async (): Promise<User[]> => {
        if (USE_MOCK_API) {
            return StorageService.getUsers();
        }
        const response = await api.get('/users');
        return response.data;
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (USE_MOCK_API) {
            return StorageService.getCurrentUser();
        }
        try {
            const response = await api.get('/auth/me');
            return response.data;
        } catch (error) {
            return null;
        }
    },

    checkDuplicateId: async (loginId: string, role?: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicateId(loginId, role);
        }
        const response = await api.get(`/auth/check-id?id=${loginId}&role=${role}`);
        return response.data.exists;
    },

    checkDuplicateEmail: async (email: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicateEmail(email);
        }
        const response = await api.get(`/auth/check-email?email=${email}`);
        return response.data.exists;
    },

    checkDuplicatePhone: async (phone: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicatePhone(phone);
        }
        const response = await api.get(`/auth/check-phone?phone=${phone}`);
        return response.data.exists;
    },

    register: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'accountStatus'>): Promise<{ success: boolean, message?: string }> => {
        if (USE_MOCK_API) {
            return StorageService.register(user);
        }
        try {
            await api.post('/auth/register', user);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || '회원가입 실패' };
        }
    },

    login: async (id: string, password?: string, role?: string): Promise<{ success: boolean, user?: User, message?: string, code?: 'LOCKED' | 'EXPIRED' }> => {
        if (USE_MOCK_API) {
            // Simulate network delay for realism even in mock?
            await new Promise(resolve => setTimeout(resolve, 500));
            return StorageService.login(id, password, role);
        }
        try {
            const response = await api.post('/auth/login', { id, password, role });
            const { token, user } = response.data;
            if (token) {
                localStorage.setItem('token', token);
            }
            return { success: true, user };
        } catch (error: any) {
            return {
                success: false,
                message: error.response?.data?.message || '로그인 실패',
                code: error.response?.data?.code
            };
        }
    },

    logout: async () => {
        if (USE_MOCK_API) {
            StorageService.logout();
        } else {
            localStorage.removeItem('token');
            // optionally call logout endpoint
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },

    updateUser: async (updatedUser: User): Promise<{ success: boolean, message?: string }> => {
        if (USE_MOCK_API) {
            return StorageService.updateUser(updatedUser);
        }
        try {
            await api.put(`/users/${updatedUser.id}`, updatedUser);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    deleteUser: async (userId: string): Promise<{ success: boolean, message?: string }> => {
        if (USE_MOCK_API) {
            const users = StorageService.getUsers();
            const newUsers = users.filter(u => u.id !== userId);
            if (users.length === newUsers.length) {
                return { success: false, message: '사용자를 찾을 수 없습니다.' };
            }
            if (typeof window !== 'undefined') {
                localStorage.setItem('fms_users', JSON.stringify(newUsers));
            }
            return { success: true };
        }
        try {
            await api.delete(`/users/${userId}`);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
};
