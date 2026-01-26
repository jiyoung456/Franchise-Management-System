import { Store, QSCTemplate, Inspection, EventLog, ActionItem, QSCItem, User } from '@/types';
import { MOCK_STORES } from './mock/mockData';
import { MOCK_TEMPLATES, MOCK_INSPECTIONS } from './mock/mockQscData';
import { MOCK_EVENTS } from './mock/mockEventData';
import { MOCK_ACTIONS } from './mock/mockActionData';

export type { QSCTemplate, QSCItem, User };

export interface BaselineConfig {
    target: 'ALL' | 'REGION';
    targetValue?: string;
    metric: 'REVENUE' | 'QSC';
    standardValue: number;
    allowedDeviation: number;
    consecutiveDays: number;
}

export interface Attachment {
    name: string;
    size: string;
    type: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string;
    author: string;
    date: string;
    role: 'ADMIN';
    isImportant: boolean;
    viewCount: number;
    attachments?: Attachment[];
}

const STORAGE_KEYS = {
    STORES: 'fms_stores',
    USERS: 'fms_users',
    CURRENT_USER: 'fms_current_user',
    TEMPLATES: 'fms_qsc_templates',
    BASELINE: 'fms_policy_baseline',
    NOTICES: 'fms_notices',
    INSPECTIONS: 'fms_inspections',
    EVENTS: 'fms_events',
    ACTIONS: 'fms_actions'
};

export const MOCK_NOTICES: Notice[] = [
    {
        id: '1',
        title: '[필독] 2026년 상반기 위생 점검 가이드라인 배포',
        content: '2026년 상반기 위생 점검 가이드라인입니다. 첨부드린 파일을 확인하고 숙지 바랍니다.\n\n주요 변경 사항:\n1. 개인 위생 점검 항목 강화\n2. 주방 기기 청결 기준 세분화',
        author: '김관리',
        date: '2025-12-28T09:00:00',
        role: 'ADMIN',
        isImportant: true,
        viewCount: 142
    },
    {
        id: '2',
        title: '설 연휴 기간 매장 운영 지침 안내',
        content: '설 연휴 기간 매장 운영에 대한 본사 지침입니다. 특이 사항 발생 시 SV에게 즉시 보고 바랍니다.',
        author: '박본사',
        date: '2026-01-10T14:30:00',
        role: 'ADMIN',
        isImportant: false,
        viewCount: 56
    }
];

export const StorageService = {
    // --- INIT ---
    init: () => {
        if (typeof window === 'undefined') return;

        // Version Control for Data Reset
        const CURRENT_VERSION = 'v1.2_cleanup';
        const storedVersion = localStorage.getItem('fms_version');

        if (storedVersion !== CURRENT_VERSION) {
            console.log('Storage Version Mismatch: Clearing Old Data...');
            // Keep the current user if possible, or just wipe everything for clean slate as requested
            // User said "Delete old data", "I will try again". So full wipe is safer to remove "Old SVs".
            localStorage.clear();
            localStorage.setItem('fms_version', CURRENT_VERSION);
        }

        // Initialize Stores if empty
        if (!localStorage.getItem(STORAGE_KEYS.STORES)) {
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(MOCK_STORES));
        }

        // Initialize Users if empty
        if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
            // Only add Admin by default. No extra SVs to avoid confusion.
            const defaultAdmin: User = {
                id: 'admin-uuid-1',
                loginId: 'admin',
                email: 'admin@fms.com',
                password: '123',
                userName: '시스템관리자',
                phone: '010-1234-5678',
                department: '서울/경기',
                role: 'ADMIN',
                accountStatus: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                passwordUpdatedAt: new Date().toISOString(),
                loginAttempts: 0
            };
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([defaultAdmin]));
        }

        // Initialize Templates
        if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
            localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(MOCK_TEMPLATES));
        }

        // Initialize Notices
        if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
            localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(MOCK_NOTICES));
        }

        // Initialize Inspections
        if (!localStorage.getItem(STORAGE_KEYS.INSPECTIONS)) {
            localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(MOCK_INSPECTIONS));
        }

        // Initialize Events
        if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
            localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
        }

        // Initialize Actions
        if (!localStorage.getItem(STORAGE_KEYS.ACTIONS)) {
            localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(MOCK_ACTIONS));
        }
    },

    // --- USER / AUTH ---
    checkDuplicateId: (loginId: string, role?: string): boolean => {
        const users = StorageService.getUsers();
        // If role is provided, check for duplicates ONLY within that role
        if (role) {
            return users.some(u => u.loginId === loginId && u.role === role);
        }
        // Fallback (should not be used ideally, but for safety)
        return users.some(u => u.loginId === loginId);
    },

    checkDuplicateEmail: (email: string): boolean => {
        const users = StorageService.getUsers();
        return users.some(u => u.email === email);
    },

    checkDuplicatePhone: (phone: string): boolean => {
        const users = StorageService.getUsers();
        return users.some(u => u.phone === phone);
    },

    // Helper to save users
    _saveUsers: (users: User[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        }
    },

    register: (user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'accountStatus'>): { success: boolean, message?: string } => {
        const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        // 1. Check ID Duplicate (Per Role) - The UI should have checked this, but double check
        if (users.find(u => u.loginId === user.loginId && u.role === user.role)) {
            return { success: false, message: '이미 해당 직군에 사용 중인 아이디입니다.' };
        }

        // 2. Check Email Duplicate (Global)
        if (users.find(u => u.email === user.email)) {
            return { success: false, message: '이미 사용 중인 이메일입니다.' };
        }

        // 3. Check Phone Duplicate (Global)
        if (users.find(u => u.phone === user.phone)) {
            return { success: false, message: '이미 사용 중인 전화번호입니다.' };
        }

        const newUser: User = {
            ...user,
            id: `user-${Date.now()}`,
            accountStatus: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            passwordUpdatedAt: new Date().toISOString(),
            loginAttempts: 0
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        return { success: true };
    },

    login: (id: string, password?: string, role?: string): { success: boolean, user?: User, message?: string, code?: 'LOCKED' | 'EXPIRED' } => {
        const usersStr = localStorage.getItem(STORAGE_KEYS.USERS);
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        // Match by loginId (ID) AND Role
        // If role is NOT provided (legacy call), finding ANY user with that ID might be ambiguous
        // But for safety, we prioritize exact match if role is given.

        let userIndex = -1;

        if (role) {
            userIndex = users.findIndex(u => u.loginId === id && u.role === role);
        } else {
            // Fallback: This effectively picks the first one found if duplicates exist, 
            // which is why passing role is critical.
            userIndex = users.findIndex(u => u.loginId === id);
        }

        if (userIndex === -1) {
            // Fallback for demo SV
            if (id === 'sv' && (!role || role === 'SUPERVISOR')) {
                // ... existing demo sv logic ...
                const demoSv: User = {
                    id: 'sv-uuid-1',
                    loginId: 'sv',
                    email: 'sv@fms.com',
                    password: '123',
                    userName: '김관리',
                    phone: '010-0000-0000',
                    department: '서울/경기',
                    role: 'SUPERVISOR',
                    accountStatus: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    passwordUpdatedAt: new Date().toISOString()
                };
                localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(demoSv));
                return { success: true, user: demoSv };
            }
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        const user = users[userIndex];

        // 1. Check Lockout
        if (user.lockedUntil) {
            if (new Date(user.lockedUntil) > new Date()) {
                const remaining = Math.ceil((new Date(user.lockedUntil).getTime() - new Date().getTime()) / 60000);
                return {
                    success: false,
                    message: `계정이 잠겨있습니다. ${remaining}분 후에 다시 시도해주세요.`,
                    code: 'LOCKED'
                };
            } else {
                // Lock expired
                user.lockedUntil = undefined;
                user.loginAttempts = 0;
            }
        }

        // 2. Check Password
        if (password && user.password !== password) {
            // Increment Failed Attempts
            user.loginAttempts = (user.loginAttempts || 0) + 1;

            let msg = '비밀번호가 일치하지 않습니다.';

            // Check if needs lock
            if (user.loginAttempts >= 6) {
                // Lock for 30 minutes (or indefinitely as per requirement? Requirement said "Account Lock", implies manual unlock or timeout. Usually timeout is safer for MVP).
                // Let's do 30 mins timeout for auto-recovery or just "Lock". 
                // Req: "Account Lock". Let's set a long time or just flags. 
                // Interpretation: Simple lock prevents login. Let's say 30 mins is standard 'soft' lock.
                const lockTime = new Date();
                lockTime.setMinutes(lockTime.getMinutes() + 30);
                user.lockedUntil = lockTime.toISOString();
                msg = '비밀번호를 6회 이상 틀려 계정이 30분간 잠겼습니다.';
            } else {
                msg = `비밀번호가 일치하지 않습니다. (${user.loginAttempts}/6)`;
            }

            users[userIndex] = user;
            StorageService._saveUsers(users);

            return { success: false, message: msg };
        }

        // 3. Success
        // Reset attempts
        user.loginAttempts = 0;
        user.lockedUntil = undefined;
        user.lastLoginAt = new Date().toISOString();

        // 4. Check Password Expiration
        // 6 months = approx 180 days
        const lastPwUpdate = user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt) : new Date(user.createdAt);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        if (lastPwUpdate < sixMonthsAgo) {
            // Provide user but with warning/message? or block?
            // "Password expiration is 6 months setting" -> usually means "Must change password".
            // We can return success but with a CODE 'EXPIRED' so UI can show a modal or redirect to change password page.
            // For now, let's allow login but alert user.
            // Or better, return success: false? No, user credentials ARE correct.
            // Let's return success: true but with code: 'PW_EXPIRED_WARNING' or similar.
            // Or user requested "Account Lock" for failures, and "Password Expiration" period.
            // Usually expiration forces a change. 
            // I'll update the user object in storage and return customized success.
            // But wait, if I return success, the page redirects.
            // I should return success: true, code: 'EXPIRED'. Login page handles it.

            // For THIS request, let's treat it as a "Login Success but needs action"
        }

        users[userIndex] = user;
        StorageService._saveUsers(users); // Helper method I just added or need to access localStorage directly if I didn't add it.
        // Wait, I updated replacement chunk to add `_saveUsers` helper? 
        // Yes, checking the previous chunk... "Helper to save users". I added it.

        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

        // Return result
        // Check expiration again for return code
        if (lastPwUpdate < sixMonthsAgo) {
            return { success: true, user, message: '비밀번호 변경 주기가 6개월이 지났습니다. 비밀번호를 변경해주세요.', code: 'EXPIRED' };
        }

        return { success: true, user };
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = '/login';
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const json = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return json ? JSON.parse(json) : null;
    },

    getUsers: (): User[] => {
        if (typeof window === 'undefined') return [];
        const json = localStorage.getItem(STORAGE_KEYS.USERS);
        return json ? JSON.parse(json) : [];
    },

    updateUser: (updatedUser: User): { success: boolean, message?: string } => {
        const users = StorageService.getUsers();
        const index = users.findIndex(u => u.id === updatedUser.id);

        if (index === -1) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        updatedUser.updatedAt = new Date().toISOString();
        users[index] = updatedUser;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

        // Update current user if it's the same person
        const currentUser = StorageService.getCurrentUser();
        if (currentUser && currentUser.id === updatedUser.id) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }

        return { success: true };
    },

    deleteUser: (email: string): { success: boolean, message?: string } => {
        const users = StorageService.getUsers();
        const newUsers = users.filter(u => u.email !== email);

        if (users.length === newUsers.length) {
            return { success: false, message: '사용자를 찾을 수 없습니다.' };
        }

        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(newUsers));
        return { success: true };
    },

    // --- STORES ---
    getStores: (): Store[] => {
        if (typeof window === 'undefined') return MOCK_STORES;
        const json = localStorage.getItem(STORAGE_KEYS.STORES);
        return json ? JSON.parse(json) : MOCK_STORES;
    },

    getStore: (id: string): Store | undefined => {
        const stores = StorageService.getStores();
        return stores.find(s => s.id === id);
    },

    addStore: (newStore: Store) => {
        const stores = StorageService.getStores();
        stores.push(newStore);
        localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
    },

    updateStore: (updatedStore: Store) => {
        const stores = StorageService.getStores();
        const index = stores.findIndex(s => s.id === updatedStore.id);
        if (index !== -1) {
            stores[index] = updatedStore;
            localStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(stores));
        }
    },

    // --- QSC TEMPLATES ---
    getTemplates: (): QSCTemplate[] => {
        if (typeof window === 'undefined') return MOCK_TEMPLATES;
        const json = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        return json ? JSON.parse(json) : MOCK_TEMPLATES;
    },

    getTemplate: (id: string): QSCTemplate | undefined => {
        const templates = StorageService.getTemplates();
        return templates.find(t => t.id === id);
    },

    saveTemplate: (template: QSCTemplate) => {
        const templates = StorageService.getTemplates();
        const index = templates.findIndex(t => t.id === template.id);

        if (index !== -1) {
            templates[index] = template;
        } else {
            templates.push(template);
        }
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    },

    deleteTemplate: (id: string) => {
        const templates = StorageService.getTemplates();
        const newTemplates = templates.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(newTemplates));
    },

    // --- BASELINE CONFIG ---
    getBaseline: (): BaselineConfig => {
        if (typeof window !== 'undefined') {
            const data = localStorage.getItem(STORAGE_KEYS.BASELINE);
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
            localStorage.setItem(STORAGE_KEYS.BASELINE, JSON.stringify(config));
        }
    },

    // --- NOTICES ---
    getNotices: (): Notice[] => {
        if (typeof window === 'undefined') return MOCK_NOTICES;
        const json = localStorage.getItem(STORAGE_KEYS.NOTICES);
        return json ? JSON.parse(json) : MOCK_NOTICES;
    },

    getNotice: (id: string): Notice | undefined => {
        const notices = StorageService.getNotices();
        return notices.find(n => n.id === id);
    },

    saveNotice: (notice: Notice) => {
        const notices = StorageService.getNotices();
        const index = notices.findIndex(n => n.id === notice.id);

        if (index !== -1) {
            notices[index] = notice;
        } else {
            notices.unshift(notice); // Add new to top
        }
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
    },

    deleteNotice: (id: string) => {
        const notices = StorageService.getNotices();
        const newNotices = notices.filter(n => n.id !== id);
        localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(newNotices));
    },

    incrementNoticeView: (id: string) => {
        const notices = StorageService.getNotices();
        const index = notices.findIndex(n => n.id === id);
        if (index !== -1) {
            notices[index].viewCount += 1;
            localStorage.setItem(STORAGE_KEYS.NOTICES, JSON.stringify(notices));
        }
    },

    // --- INSPECTIONS ---
    getInspections: (): Inspection[] => {
        if (typeof window === 'undefined') return MOCK_INSPECTIONS;
        const json = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
        return json ? JSON.parse(json) : MOCK_INSPECTIONS;
    },

    getInspection: (id: string): Inspection | undefined => {
        const inspections = StorageService.getInspections();
        return inspections.find(i => i.id === id);
    },

    saveInspection: (inspection: Inspection) => {
        const inspections = StorageService.getInspections();
        const index = inspections.findIndex(i => i.id === inspection.id);
        if (index !== -1) {
            inspections[index] = inspection;
        } else {
            inspections.unshift(inspection);
        }
        localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
    },

    getStoresBySv: (svId: string): Store[] => {
        const stores = StorageService.getStores();
        return stores.filter(s => s.currentSupervisorId === svId);
    },

    // --- EVENTS ---
    getEvents: (): EventLog[] => {
        if (typeof window === 'undefined') return MOCK_EVENTS;
        const json = localStorage.getItem(STORAGE_KEYS.EVENTS);
        return json ? JSON.parse(json) : MOCK_EVENTS;
    },

    getEvent: (id: string): EventLog | undefined => {
        const events = StorageService.getEvents();
        return events.find(e => e.id === id);
    },

    saveEvent: (event: EventLog) => {
        const events = StorageService.getEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index !== -1) {
            events[index] = event;
        } else {
            events.unshift(event);
        }
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    },

    // --- ACTIONS ---
    getActions: (): ActionItem[] => {
        if (typeof window === 'undefined') return MOCK_ACTIONS;
        const json = localStorage.getItem(STORAGE_KEYS.ACTIONS);
        return json ? JSON.parse(json) : MOCK_ACTIONS;
    },

    getAction: (id: string): ActionItem | undefined => {
        const actions = StorageService.getActions();
        return actions.find(a => a.id === id);
    },

    saveAction: (action: ActionItem) => {
        const actions = StorageService.getActions();
        const index = actions.findIndex(a => a.id === action.id);
        if (index !== -1) {
            actions[index] = action;
        } else {
            actions.unshift(action);
        }
        localStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(actions));
    }
};
