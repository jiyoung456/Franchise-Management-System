import { MOCK_STORES } from './mockData';
import { ActionItem, EffectAnalysis } from '@/types';


// 2. Mock Data Generator
const ACTIONS: ActionItem[] = [
    {
        id: 'act_001',
        storeId: '2',
        title: '위생 점수 저하 긴급 점검',
        type: 'VISIT',
        status: 'COMPLETED',
        priority: 'CRITICAL',
        assignee: '김관리 SV',
        dueDate: '2025-11-20',
        description: '최근 위생 점수 60점대 하락. 현장 방문하여 주방 위생 상태 점검 및 교육 실시.',
        completedAt: '2025-11-18',
        completionNote: '주방 후드 청소 불량 확인 및 즉시 시정 조치. 재교육 완료.',
        linkedRiskId: 'risk_001'
    },
    {
        id: 'act_002',
        storeId: '2',
        title: '매출 하락 원인 분석 및 프로모션 기획',
        type: 'PROMOTION',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignee: '박기획 대리',
        dueDate: '2025-12-05',
        description: '경쟁사 오픈으로 인한 매출 하락 대응.',
    },
    {
        id: 'act_003',
        storeId: '1',
        title: '신메뉴 레시피 교육',
        type: 'TRAINING',
        status: 'OPEN',
        priority: 'MEDIUM',
        assignee: '김관리 SV',
        dueDate: '2025-12-10',
        description: '겨울 시즌 메뉴 조리법 교육 필요.',
    }
];

// 3. Mock Analysis Engine
export function getActionAnalysis(actionId: string): EffectAnalysis | null {
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action || action.status !== 'COMPLETED') return null;

    // Mock logic: randomly generate improvement stats consistently for the same action ID
    // For 'act_001', let's simulate a QSC improvement
    if (actionId === 'act_001') {
        return {
            actionId,
            metric: 'QSC',
            preValue: 65,
            postValue: 82,
            improvementRate: 26.1,
            status: 'IMPROVED'
        };
    }

    return null;
}

export const MOCK_ACTIONS = ACTIONS;
