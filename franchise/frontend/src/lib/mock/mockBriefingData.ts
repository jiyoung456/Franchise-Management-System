import { DailyBriefing } from '@/types';

export const MOCK_BRIEFING: DailyBriefing = {
    date: new Date().toISOString().split('T')[0],
    summary: "오늘 강남권역의 리스크 점수가 전일 대비 15% 상승했습니다. 특히 '강남역점'의 위생 등급 하락 리스크가 감지되어 긴급 점검이 필요합니다. 2건의 템플릿 승인 요청이 대기 중입니다.",
    todoList: [
        { id: '1', text: '강남역점 긴급 위생 점검', isCompleted: false, type: 'CHECK', priority: 'HIGH' },
        { id: '2', text: '2025 상반기 정기 점검 템플릿 승인', isCompleted: false, type: 'APPROVE', priority: 'HIGH' },
        { id: '3', text: '역삼점 매출 하락 원인 분석 리포트 확인', isCompleted: false, type: 'REVIEW', priority: 'MEDIUM' },
        { id: '4', text: '부산 지역 신규 매장 방문 일정 조율', isCompleted: true, type: 'CHECK', priority: 'LOW' }
    ],
    priorityStores: [
        { storeId: 'store-1', storeName: '강남역점', reason: '위생 리스크 급증 (85점)', riskScore: 85, eventId: 'evt-1' },
        { storeId: 'store-3', storeName: '부산서면점', reason: '식자재 품질 클레임 발생', riskScore: 72, eventId: 'evt-3' },
        { storeId: 'store-5', storeName: '홍대입구점', reason: '3일 연속 매출 하락', riskScore: 68 }
    ],
    keyMetrics: {
        totalIssues: 5,
        criticalIssues: 2,
        pendingApprovals: 2
    }
};
