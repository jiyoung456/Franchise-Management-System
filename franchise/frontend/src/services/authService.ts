import { User } from '@/types';
import { StorageService } from '@/lib/storage';

export const AuthService = {
    init: () => {
        StorageService.init();
    },

    getUsers: (): User[] => {
        return StorageService.getUsers();
    },

    getCurrentUser: (): User | null => {
        return StorageService.getCurrentUser();
    },

    checkDuplicateId: (loginId: string, role?: string): boolean => {
        return StorageService.checkDuplicateId(loginId, role);
    },

    checkDuplicateEmail: (email: string): boolean => {
        return StorageService.checkDuplicateEmail(email);
    },

    checkDuplicatePhone: (phone: string): boolean => {
        return StorageService.checkDuplicatePhone(phone);
    },

    register: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'accountStatus'>): { success: boolean, message?: string } => {
        return StorageService.register(user);
    },

    login: (id: string, password?: string, role?: string): { success: boolean, user?: User, message?: string } => {
        return StorageService.login(id, password, role);
    },

    logout: () => {
        StorageService.logout();
    },

    updateUser: (updatedUser: User): { success: boolean, message?: string } => {
        return StorageService.updateUser(updatedUser);
    },

    deleteUser: (userId: string): { success: boolean, message?: string } => {
        // StorageService might not have deleteUser, let's implement if needed or skip.
        // StorageService doesn't have deleteUser in view_file.
        // For now, I'll implement it here using StorageService.getUsers/save?
        // Or better, add deleteUser to StorageService?
        // Let's simple implement here for now or just throw not implemented if not used.
        // It was used in old AuthService.
        const users = StorageService.getUsers();
        const newUsers = users.filter(u => u.id !== userId);

        if (users.length === newUsers.length) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        // We need a way to save back to StorageService.
        // StorageService doesn't export a generic 'saveUsers'.
        // I should probably add deleteUser to StorageService to be clean.
        // But for now, to save time/complexity, I'll access localStorage directly for this one edge case
        // adhering to StorageService keys convention (fms_users).
        // Or better, just don't support delete for now if not critical. 
        // The old code had duplicate logic.

        // Let's unimplemented it properly later if needed. Use direct localStorage for now if critical.
        if (typeof window !== 'undefined') {
            localStorage.setItem('fms_users', JSON.stringify(newUsers));
        }
        return { success: true };
    }
};
