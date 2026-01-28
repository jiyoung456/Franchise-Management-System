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


    checkDuplicateId: async (loginId: string, role?: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicateId(loginId, role);
        }
        // Backend checks duplicates across ALL roles, doesn't need role parameter
        const response = await api.get(`/auth/check-loginId?loginId=${loginId}`);
        // Backend returns { available: boolean }, we need to invert it
        return !response.data.data.available;
    },

    checkDuplicateEmail: async (email: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicateEmail(email);
        }
        // Backend endpoint not implemented yet, skip duplicate check
        return false;
    },

    checkDuplicatePhone: async (phone: string): Promise<boolean> => {
        if (USE_MOCK_API) {
            return StorageService.checkDuplicatePhone(phone);
        }
        // Backend endpoint not implemented yet, skip duplicate check
        return false;
    },

    register: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'accountStatus'>): Promise<{ success: boolean, message?: string }> => {
        if (USE_MOCK_API) {
            return StorageService.register(user);
        }
        try {
            // Map frontend fields to backend fields
            // Frontend: department = 지역 (서울/경기, 부산/경남 등)
            // Frontend: team = 부서 (운영1팀, 운영2팀 등)
            // Backend: region = 지역
            // Backend: department = 부서
            const signupData = {
                role: user.role,
                loginId: user.loginId,
                password: user.password,
                passwordConfirm: user.password,
                userName: user.userName,
                email: user.email,
                region: user.department,      // Frontend 'department' (지역) -> Backend 'region'
                department: user.team          // Frontend 'team' (부서) -> Backend 'department'
            };
            console.log('Sending signup data:', signupData);
            const response = await api.post('/auth/signup', signupData);
            console.log('Signup response:', response.data);
            return { success: true };
        } catch (error: any) {
            console.error('Signup error:', error.response?.data || error);
            // Extract error message from various possible locations
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                '회원가입 실패';
            return { success: false, message: errorMessage };
        }
    },

    login: async (id: string, password?: string, role?: string): Promise<{ success: boolean, user?: User, message?: string, code?: 'LOCKED' | 'EXPIRED' }> => {
        if (USE_MOCK_API) {
            // Simulate network delay for realism even in mock?
            await new Promise(resolve => setTimeout(resolve, 500));
            return StorageService.login(id, password, role);
        }
        try {
            const response = await api.post('/auth/login', { loginId: id, password, role });
            // Backend returns ApiResponse<AuthUserResponse>
            // Structure: { success: true, data: { userId, userName, role, loginId, department, region } }
            // Token is sent via HttpOnly cookie, not in response body
            const userData = response.data.data;

            // Map backend fields to frontend User type
            const user: User = {
                id: userData.userId.toString(),
                loginId: userData.loginId,
                userName: userData.userName,
                email: '', // Not returned in login response
                department: userData.region as any, // Backend 'region' -> Frontend 'department'
                team: userData.department as any,   // Backend 'department' -> Frontend 'team'
                role: userData.role,
                accountStatus: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Store user in localStorage for session management
            localStorage.setItem('currentUser', JSON.stringify(user));

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
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (USE_MOCK_API) {
            return StorageService.getCurrentUser();
        }
        // For real API, check localStorage first
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                return JSON.parse(storedUser);
            }
        }
        // Optionally try to fetch from backend /auth/me if no local data
        try {
            const response = await api.get('/auth/me');
            const userData = response.data.data;
            const user: User = {
                id: userData.userId.toString(),
                loginId: userData.loginId,
                userName: userData.userName,
                email: '',
                department: userData.region as any,
                team: userData.department as any,
                role: userData.role,
                accountStatus: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            return user;
        } catch (error) {
            return null;
        }
    }
};
