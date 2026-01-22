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
    const store = MOCK_STORES.find(s => s.id === storeId);
    if (!store) throw new Error('Store not found');

    const factors: NumericalEvidence[] = [];
    const patterns: PatternEvidence[] = [];
    const context: ContextEvidence[] = [];
    const baseScore = 20;

    // A. Numerical Evidence (QSC)
    const qscScore = store.qscScore || 85;
    if (qscScore < 70) {
        factors.push({
            id: 'f_qsc_critical', category: 'QSC', label: 'QSC 점검 불합격 수준',
            value: `${qscScore}점`, weight: 1.0, impactScore: 40
        });
        patterns.push({
            id: 'p_qsc_repeat', type: 'REPEATED', description: '동일 위생 항목 반복 지적', detectedCount: 3
        });
    } else if (qscScore < 80) {
        factors.push({
            id: 'f_qsc_warn', category: 'QSC', label: 'QSC 품질 저하',
            value: `${qscScore}점`, weight: 0.5, impactScore: 15
        });
    }

    // B. POS Evidence
    if (['2', '4'].includes(storeId)) {
        factors.push({
            id: 'f_pos_drop', category: 'POS', label: '주간 매출 지속 하락',
            value: '-18%', weight: 0.8, impactScore: 25
        });
        patterns.push({
            id: 'p_sales_consecutive', type: 'CONSECUTIVE_DROP', description: '4주 연속 매출 하락세', detectedCount: 4
        });
    }

    // C. Operation Evidence
    if (store.currentState === 'RISK') {
        factors.push({
            id: 'f_ops_risk', category: 'OPERATION', label: '집중 관리 대상(Risk) 지정',
            value: 'RISK 상태', weight: 0.9, impactScore: 30
        });
        context.push({
            id: 'c_status_change', type: 'STATUS_CHANGE', description: '최근 WATCHLIST → RISK 상태 하향 조정됨', date: new Date().toISOString().split('T')[0]
        });
    }

    // Mock Context for Action Delay
    if (storeId === '1' || storeId === '3') {
        context.push({
            id: 'c_action_delay', type: 'ACTION_DELAY', description: '주요 개선 조치(위생 교육) 5일 이상 지연', date: '2025-11-20'
        });
    }

    // Calculate Total
    let totalRiskScore = baseScore + factors.reduce((sum, f) => sum + f.impactScore, 0);
    totalRiskScore = Math.min(100, Math.max(0, totalRiskScore));

    let riskLevel: RiskLevel = 'NORMAL';
    if (totalRiskScore >= 75) riskLevel = 'RISK';
    else if (totalRiskScore >= 50) riskLevel = 'WATCHLIST';

    // Anomaly Result
    let anomaly: AnomalyResult | null = null;
    if (riskLevel === 'RISK') {
        anomaly = {
            isAnomaly: true,
            detectedAt: new Date().toISOString(),
            severity: 'HIGH',
            summary: `최근 2주간 매출이 평균 대비 18% 감소하였으며, 최근 QSC 점검에서 위생 점수가 ${qscScore}점으로 하락했습니다.`,
            features: ['매출 급락', '위생 점수 저하', '재방문율 감소 추세']
        };
    }

    // New Fields Population (Mock Logic)
    const metricAnomalies: MetricAnomaly[] = [];
    if (riskLevel !== 'NORMAL') {
        metricAnomalies.push({ label: '주간 매출', current: '850만', baseline: '1,050만', deviation: '-19%', severity: 'HIGH' });
        metricAnomalies.push({ label: '재방문율', current: '42%', baseline: '55%', deviation: '-13%p', severity: 'MEDIUM' });
    }

    const operationalGaps: OperationalGap[] = [];
    if (storeId === '1') {
        operationalGaps.push({ type: 'SV 방문', description: '정기 방문 주기 초과', duration: '12일' });
    }

    const rootCauses = factors.sort((a, b) => b.impactScore - a.impactScore).slice(0, 3).map(f => f.label);

    const history = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const variance = Math.floor(Math.random() * 10) - 5;
        return {
            date: date.toISOString().split('T')[0],
            score: Math.min(100, Math.max(0, totalRiskScore - 5 + variance))
        };
    });

    return {
        storeId: store.id,
        storeName: store.name,
        totalRiskScore,
        riskLevel,
        factors,
        patterns,
        context,
        anomaly,
        history,
        metricAnomalies,
        operationalGaps,
        rootCauses
    };
}

// 3. Generate Mock Data for All Stores
export const MOCK_RISK_PROFILES: Record<string, RiskProfile> = {};
const initRiskData = () => {
    try {
        if (!MOCK_STORES || !Array.isArray(MOCK_STORES)) {
            console.warn('MOCK_STORES not ready for Risk Data generation');
            return;
        }
        MOCK_STORES.forEach(s => {
            MOCK_RISK_PROFILES[s.id] = calculateRisk(s.id);
        });
    } catch (e) {
        console.error('Failed to initialize MOCK_RISK_PROFILES', e);
    }
};

initRiskData();
