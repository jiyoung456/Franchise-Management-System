// User & Auth
export interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export type Department = '서울/경기' | '부산/경남' | '강원/충청' | '전라/광주' | '대구/울산/경북' | '제주';
export type Rank = 'HQ_ADMIN' | 'SV_TEAM_LEADER' | 'SV_SUPERVISOR';

export interface User {
    id: string; // UUID (PK)
    loginId: string; // was username
    password?: string;
    userName: string; // was name
    email: string;
    phone: string;
    department: Department;
    role: 'ADMIN' | 'MANAGER' | 'SUPERVISOR'; // ENUM
    accountStatus: boolean; // account_status
    lastLoginAt?: string; // last_login_at
    createdAt: string;
    updatedAt: string;
    // Security
    passwordUpdatedAt?: string;
    loginAttempts?: number;
    lockedUntil?: string;
    avatarUrl?: string;
}

// Stores
export interface StatusHistory {
    date: string;
    reason: string;
    oldStatus: string;
    newStatus: string;
    changer: string;
}

export interface Store {
    id: number;
    name: string;
    state: 'NORMAL' | 'WATCHLIST' | 'RISK'; // Kept for list page compatibility
    region: string;
    description: string;
    manager: string;
    storePhone: string;
    supervisor: string; // Legacy SV name
    qscScore: number;
    lastInspectionDate: string | null;

    // Added for StoreDetailContent compatibility
    regionCode: string;
    currentSupervisorId: string;
    operationStatus: 'OPEN' | 'CLOSED' | 'CLOSED_TEMPORARY';
    currentState: 'NORMAL' | 'WATCHLIST' | 'RISK';
    currentStateScore: number;
    openedAt: string; // ISO Date
    statusHistory: StatusHistory[];
    ownerName: string;
    ownerPhone: string;
    address: string;
    contractType: string;
    contractEndAt: string;
}

// StoreDetail is now effectively same as Store, but we keep it if imported elsewhere
export interface StoreDetail extends Store { }

// API DTOs
export interface StoreSearchRequest {
    state?: 'NORMAL' | 'WATCHLIST' | 'RISK';
    keyword?: string;
    sort?: 'QSC_SCORE_DESC' | 'QSC_SCORE_ASC' | 'INSPECTED_AT_DESC' | 'INSPECTED_AT_ASC';
    limit?: number;
}

export interface StoreListResponse {
    storeId: number;
    storeName: string;
    state: string; // 'NORMAL' | 'WATCHLIST' | 'RISK' (Backend returns string, probably enum name)
    region: string;
    supervisor: string;
    qscScore: number;
    lastInspectionDate: string; // LocalDate -> string (YYYY-MM-DD)
}

// Removed Mock/Old Interfaces

export interface StoreEventResponse {
    id: number;
    type: 'QSC' | 'POS' | 'RISK' | 'STORE';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    title: string;
    message: string;
    occurredAt: string;
    status: 'OPEN' | 'RESOLVED';
}

export interface StoreUpdateRequest {
    storeOperationStatus?: string; // 'OPEN' | 'CLOSED'
    storeName?: string;
    ownerName?: string;
    ownerPhone?: string;
    currentSupervisorId?: string; // Was supervisorLoginId
    currentState?: string; // 'NORMAL' | 'WATCHLIST' | 'RISK'
    adminMemo?: string; // Kept just in case, though not in Java DTO shown
}

// QSC
export interface QSCItem {
    id: string;
    categoryId: string;
    subcategory: string;
    name: string;
    criteria?: string;
    weight: number;
    inputType: 'SCORE';
    isRequired?: boolean;
}

export interface QSCTemplate {
    id: string;
    title: string;
    description?: string;
    version: string; // Version Info
    type?: string;
    scope: '브랜드 공통' | '서울/경기' | '직영점' | '전체 매장';
    effective_from: string; // Start Date (NOT NULL)
    effective_to: string | null; // End Date (NULL = Active)
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    items: QSCItem[];
}

export interface Inspection {
    id: string;
    date: string;
    storeId: string;
    storeName: string;
    region: string;
    sv: string;
    type: '정기' | '특별' | '재점검';
    score: number;
    grade: 'S' | 'A' | 'B' | 'C' | 'D';
    isPassed: boolean;
    isReinspectionNeeded: boolean;
    inspector: string;
    status: '완료' | '임시저장' | '점주확인';
    templateId?: string;
    answers?: Record<string, any>; // Flexible for now
    overallComment?: string;
    overallPhotos?: string[];
}

// Events
export type EventSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
export type EventType = 'QSC' | 'POS' | 'RISK' | 'STORE';
export type EventStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';

export interface EventRule {
    id: string;
    name: string;
    description: string;
    targetSystem: EventType;
    condition: string;
    severity: EventSeverity;
    isActive: boolean;
}

export interface EventLog {
    id: string;
    type: EventType;
    storeId: string;
    storeName: string;
    timestamp: string;
    severity: EventSeverity;
    message: string;
    status: EventStatus;
    relatedData?: {
        metricLabel?: string;
        value?: string | number;
        threshold?: string | number;
        linkUrl?: string;
    };
    ruleId?: string;
}

// Actions
export type ActionType = 'TRAINING' | 'VISIT' | 'PROMOTION' | 'FACILITY' | 'PERSONNEL';
export type ActionStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
export type ActionPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ActionItem {
    id: string;
    storeId: string;
    title: string;
    type: ActionType;
    status: ActionStatus;
    priority: ActionPriority;
    assignee: string;
    dueDate: string;
    description: string;
    completedAt?: string;
    completionNote?: string;
    linkedEventId?: string;
    linkedRiskId?: string;
}

export interface EffectAnalysis {
    actionId: string;
    metric: 'SALES' | 'QSC';
    preValue: number;
    postValue: number;
    improvementRate: number;
    status: 'IMPROVED' | 'MAINTAINED' | 'WORSENED';
}

// Notices & Policy
export interface Attachment {
    name: string;
    size: string;
    type: string;
}


// --- Briefing Agent ---
export interface BriefingItem {
    id: string;
    text: string;
    isCompleted: boolean;
    type: 'REVIEW' | 'APPROVE' | 'CHECK';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PriorityStore {
    storeId: string;
    storeName: string;
    reason: string; // e.g. "Risk Score: 85", "Critial Event"
    riskScore?: number;
    eventId?: string;
}

export interface DailyBriefing {
    date: string;
    summary: string; // Generated text
    todoList: BriefingItem[];
    priorityStores: PriorityStore[];
    keyMetrics: {
        totalIssues: number;
        criticalIssues: number;
        pendingApprovals: number;
    };
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

export interface BaselineConfig {
    target: 'ALL' | 'REGION';
    targetValue?: string;
    metric: 'REVENUE' | 'QSC';
    standardValue: number;
    allowedDeviation: number;
    consecutiveDays: number;
}
