import { DailyBriefing } from '@/types';

export const MOCK_BRIEFING: DailyBriefing = {
    date: '2025-09-01',
    summary: "오늘 담당 권역에서 CRITICAL 이벤트 2건이 발생했습니다. 특히 망원점과 청량리점의 위험도가 상승하여 즉시 조치 생성 및 재점검 승인이 필요합니다.",
    todoList: [
        { id: '1', text: '망원점 주의/심각 이벤트 조치 생성', isCompleted: false, type: 'CHECK', priority: 'HIGH' },
        { id: '2', text: '리스크 상위 2개 점포 SV 리소스 재배치 지시', isCompleted: false, type: 'APPROVE', priority: 'HIGH' },
        { id: '3', text: '고진아 SV 진행 조치 3건 상태 점검', isCompleted: false, type: 'REVIEW', priority: 'MEDIUM' },
        { id: '4', text: '이번 주 방문 계획 승인', isCompleted: true, type: 'APPROVE', priority: 'LOW' }
    ],
    priorityStores: [
        { storeId: '1', storeName: '강남역점', reason: '위생 리스크 급증 (85점)', riskScore: 85, eventId: '1' },
        { storeId: '3', storeName: '부산서면점', reason: '식자재 품질 클레임 발생', riskScore: 72, eventId: '3' },
        { storeId: '5', storeName: '광주수완점', reason: '3일 연속 매출 하락', riskScore: 68, eventId: '5' }
    ],
    keyMetrics: {
        totalIssues: 7,
        criticalIssues: 2,
        inProgressActions: 3,
        pendingApprovals: 2
    }
};
