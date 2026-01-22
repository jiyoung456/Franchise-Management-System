// User & Auth
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

// Stores
export interface StatusHistory {
    date: string;
    reason: string;
    oldStatus: string;
    newStatus: string;
    changer: string;
}

export interface Store {
    id: string; // store_id (PK)
    name: string; // store_name
    address: string; // address
    regionCode: string; // region_code

    // IDs (Foreign Keys)
    currentSupervisorId?: string; // current_supervisor_id (FK -> User.id)
    createdById?: string; // created_by_user_id
    updatedById?: string; // updated_by_user_id

    // Enums & Types
    tradeAreaType: 'OFFICE' | 'RESIDENTIAL' | 'STATION' | 'UNIVERSITY' | 'TOURISM' | 'MIXED'; // trade_area_type
    operationStatus: 'OPEN' | 'CLOSED' | 'CLOSED_TEMPORARY'; // store_operation_status
    contractType: 'FRANCHISE' | 'DIRECT'; // contract_type
    currentState: 'NORMAL' | 'WATCHLIST' | 'RISK'; // current_state

    // Scores
    currentStateScore: number; // current_state_score (Integrated score)
    qscScore: number; // Keep for now as it seems useful, though ERD only shows current_state_score (maybe mapped?)

    // Info
    ownerName: string; // owner_name
    ownerPhone: string; // owner_phone

    // Timestamps
    openPlannedAt?: string; // open_planned_at
    openedAt?: string; // opened_at
    closedAt?: string; // closed_at
    deletedAt?: string; // deleted_at
    contractEndAt?: string; // contract_end_at
    createdAt: string; // created_at
    updatedAt: string; // updated_at

    // Legacy fields to be verified/mapped or kept for UI convenience if not in ERD explicitly but needed
    // statusHistory: StatusHistory[]; // Not in ERD image but highly likely needed for 'audit'. keeping it.
    // monthlyRevenue: number; // Not in ERD Store table, usually in Sales table. Keeping for mock/dashboard convenience.
    // growthRate: number; // Same.
    statusHistory: StatusHistory[];
    monthlyRevenue: number;
    growthRate: number;
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
