import { MOCK_STORES } from './mockData';
// import { MOCK_PERFORMANCE } from './mockSalesData';

// 1. Interfaces
export type RiskLevel = 'NORMAL' | 'WATCHLIST' | 'RISK';
export type FactorCategory = 'QSC' | 'POS' | 'OPERATION';

// REQ-RISK-08: Structured Evidence
export interface NumericalEvidence {
    id: string;
    category: FactorCategory;
    label: string;
    value: string | number;
    weight: number;
    impactScore: number; // Contribution to total score
}

export interface PatternEvidence {
    id: string;
    type: 'REPEATED' | 'CONSECUTIVE_DROP' | 'LONG_TERM_CHURN';
    description: string;
    detectedCount: number; // e.g., 3 times in last month
}

export interface ContextEvidence {
    id: string;
    type: 'EVENT' | 'STATUS_CHANGE' | 'ACTION_DELAY';
    description: string;
    date: string;
}

export interface AnomalyResult {
    isAnomaly: boolean;
    detectedAt: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    summary: string;
    features: string[];
}

export interface MetricAnomaly {
    label: string;
    current: string;
    baseline: string;
    deviation: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface OperationalGap {
    type: string;
    description: string;
    duration: string; // e.g. "5일"
}

export interface RiskProfile {
    storeId: string;
    storeName: string;
    totalRiskScore: number;
    riskLevel: RiskLevel;
    factors: NumericalEvidence[];
    patterns: PatternEvidence[];
    context: ContextEvidence[];
    anomaly: AnomalyResult | null;
    history: { date: string; score: number }[];
    // New Detailed Fields
    metricAnomalies: MetricAnomaly[];
    operationalGaps: OperationalGap[];
    rootCauses: string[];
}

// 2. Mock Logic
function calculateRisk(storeId: string): RiskProfile {
    // MOCK_STORES has storeId as number
    const store = MOCK_STORES.find(s => s.id.toString() === storeId);
    if (!store) throw new Error('Store not found');

    const factors: NumericalEvidence[] = [];
    const patterns: PatternEvidence[] = [];
    const context: ContextEvidence[] = [];
    const baseScore = 20;

    // A. QSC Factor
    const qscRisk = store.qscScore < 80 ? (80 - store.qscScore) * 1.5 : 0;
    if (qscRisk > 0) {
        factors.push({
            id: 'f_qsc', category: 'QSC', label: 'QSC 점수 미달',
            value: store.qscScore, weight: 1.5, impactScore: qscRisk
        });
    }

    // B. State Factor
    if (store.state === 'WATCHLIST') factors.push({
        id: 'f_state_watch', category: 'OPERATION', label: '관찰 대상 지정',
        value: 'WATCHLIST', weight: 10, impactScore: 10
    });
    if (store.state === 'RISK') factors.push({
        id: 'f_state_risk', category: 'OPERATION', label: '위험 등급 지정',
        value: 'RISK', weight: 20, impactScore: 20
    });

    const totalScore = Math.min(100, Math.round(baseScore + qscRisk + (store.state === 'RISK' ? 30 : 0)));
    const level: RiskLevel = totalScore >= 80 ? 'RISK' : totalScore >= 60 ? 'WATCHLIST' : 'NORMAL';

    return {
        storeId: store.id.toString(),
        storeName: store.name,
        totalRiskScore: totalScore,
        riskLevel: level,
        factors,
        patterns,
        context,
        anomaly: {
            isAnomaly: totalScore > 85,
            detectedAt: new Date().toISOString(),
            severity: totalScore > 90 ? 'HIGH' : 'MEDIUM',
            summary: totalScore > 85 ? '복합적 위험 신호가 감지되었습니다.' : '특이사항 없습니다.',
            features: ['QSC 하락', '매출 불안정']
        },
        history: [],
        metricAnomalies: [],
        operationalGaps: [],
        rootCauses: []
    };
}

// 3. Generate Mock Profiles
export const MOCK_RISK_PROFILES: Record<string, RiskProfile> = {};

if (MOCK_STORES && Array.isArray(MOCK_STORES)) {
    MOCK_STORES.forEach(store => {
        const riskScore = 100 - store.qscScore; // Simple inverse for mock
        MOCK_RISK_PROFILES[store.id.toString()] = calculateRisk(store.id.toString());
    });
}
