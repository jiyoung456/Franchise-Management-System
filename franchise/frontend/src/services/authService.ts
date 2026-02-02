import { User } from '@/types';
import api from '@/lib/api';

export const AuthService = {
    init: async () => {
    },

    getUsers: async (): Promise<User[]> => {
        // Backend endpoint /users does not exist. Returning empty array to prevent 404 errors.
        return [];
    },


    checkDuplicateId: async (loginId: string, role?: string): Promise<boolean> => {
        // Backend checks duplicates across ALL roles, doesn't need role parameter
        const response = await api.get(`/auth/check-loginId?loginId=${loginId}`);
        // Backend returns { available: boolean }, we need to invert it
        return !response.data.data.available;
    },

    checkDuplicateEmail: async (email: string): Promise<boolean> => {
        // Backend endpoint not implemented yet, skip duplicate check
        return false;
    },

    checkDuplicatePhone: async (phone: string): Promise<boolean> => {
        // Backend endpoint not implemented yet, skip duplicate check
        return false;
    },

    register: async (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'accountStatus'>): Promise<{ success: boolean, message?: string }> => {
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
            // Use 'fms_current_user' to match StorageService which is used by UI components
            localStorage.setItem('fms_current_user', JSON.stringify(user));

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
        localStorage.removeItem('token');
        localStorage.removeItem('fms_current_user');
        // optionally call logout endpoint
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },

    updateUser: async (updatedUser: User): Promise<{ success: boolean, message?: string }> => {
        try {
            await api.put(`/users/${updatedUser.id}`, updatedUser);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    deleteUser: async (userId: string): Promise<{ success: boolean, message?: string }> => {
        try {
            await api.delete(`/users/${userId}`);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    getCurrentUser: async (): Promise<User | null> => {
        // For real API, check localStorage first
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('fms_current_user');
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
            localStorage.setItem('fms_current_user', JSON.stringify(user));
            return user;
        } catch (error) {
            return null;
        }
    }
};
