import { MOCK_STORES } from './mockData';
import { EventLog, EventRule } from '@/types';


// 2. Mock Rules
export const MOCK_EVENT_RULES: EventRule[] = [
    { id: 'rule_qsc_fail', name: 'QSC 점검 불합격', description: '점검 등급이 C 또는 D인 경우', targetSystem: 'QSC', condition: 'Grade <= C', severity: 'CRITICAL', isActive: true },
    { id: 'rule_qsc_drop', name: 'QSC 점수 급락', description: '직전 대비 10점 이상 하락', targetSystem: 'QSC', condition: 'Score drop >= 10', severity: 'WARNING', isActive: true },
    { id: 'rule_sales_drop', name: '주간 매출 급락', description: '전주 대비 매출 20% 이상 하락', targetSystem: 'POS', condition: 'Weekly Revenue drop >= 20%', severity: 'CRITICAL', isActive: true },
    { id: 'rule_risk_high', name: '위험 등급 격상', description: '위험 점수가 75점을 초과하여 RISK 등급 진입', targetSystem: 'RISK', condition: 'Risk Score > 75', severity: 'CRITICAL', isActive: true },
    { id: 'rule_store_status', name: '점포 운영 상태 변경', description: '점포의 운영 상태(휴업/폐업 등)가 변경됨', targetSystem: 'STORE', condition: 'Status Changed', severity: 'INFO', isActive: true },
];

// 3. Mock Data Generator
function generateMockEvents(): EventLog[] {
    const events: EventLog[] = [];
    const now = new Date();

    MOCK_STORES.forEach(store => {
        // A. Random QSC Events
        if (Math.random() > 0.7) {
            events.push({
                id: `evt_qsc_${store.id}_${Math.floor(Math.random() * 1000)}`,
                type: 'QSC',
                storeId: store.id,
                storeName: store.name,
                timestamp: new Date(now.getTime() - Math.random() * 86400000 * 7).toISOString(),
                severity: Math.random() > 0.5 ? 'WARNING' : 'CRITICAL',
                message: Math.random() > 0.5 ? '정기 점검 결과 "C" 등급 (불합격)' : '주방 위생 카테고리 점수 급락 (-15점)',
                status: 'OPEN',
                relatedData: { metricLabel: 'Grade', value: 'C', linkUrl: `/qsc/report/mock` },
                ruleId: 'rule_qsc_fail'
            });
        }

        // B. Random POS Events
        if (Math.random() > 0.6) {
            events.push({
                id: `evt_pos_${store.id}_${Math.floor(Math.random() * 1000)}`,
                type: 'POS',
                storeId: store.id,
                storeName: store.name,
                timestamp: new Date(now.getTime() - Math.random() * 86400000 * 3).toISOString(),
                severity: 'WARNING',
                message: '지난 주 대비 매출 15% 하락 감지',
                status: 'ACKNOWLEDGED',
                relatedData: { metricLabel: 'Growth', value: '-15%', threshold: '-10%', linkUrl: `/performance/${store.id}` },
                ruleId: 'rule_sales_drop'
            });
        }

        // C. Store Status Events
        if (store.currentState === 'RISK') {
            events.push({
                id: `evt_risk_${store.id}_999`,
                type: 'RISK',
                storeId: store.id,
                storeName: store.name,
                timestamp: new Date(now.getTime() - Math.random() * 86400000 * 2).toISOString(),
                severity: 'CRITICAL',
                message: 'AI 위험 탐지: 운영 리스크 점수 82점 (Critical)',
                status: 'OPEN',
                relatedData: { metricLabel: 'Risk Score', value: 82, threshold: 75 },
                ruleId: 'rule_risk_high'
            });
        }
    });

    // D. Curated Mock Events (Preserve original demo scenarios)
    const curatedEvents: EventLog[] = [
        { id: '1', type: 'POS', storeId: '1', storeName: '강남역점', timestamp: '2026-01-15T09:30:00', severity: 'WARNING', status: 'OPEN', message: '최근 주간 매출이 목표 대비 15% 하락하여 관심이 필요합니다.', relatedData: { metricLabel: 'Sales Drop', value: '-15%' } },
        { id: '2', type: 'QSC', storeId: '2', storeName: '역삼점', timestamp: '2026-01-14T18:20:00', severity: 'CRITICAL', status: 'ACKNOWLEDGED', message: '최근 QSC 점검에서 위생 점수가 기준치(80점) 이하로 급격히 하락했습니다.', relatedData: { metricLabel: 'Grade', value: 'C' } },
        { id: '3', type: 'QSC', storeId: '3', storeName: '논현점', timestamp: '2026-01-14T11:00:00', severity: 'WARNING', status: 'OPEN', message: '조치 미연결: 후속 조치가 누락되었습니다.', relatedData: { metricLabel: 'FollowUp', value: 'Missing' } },
        { id: '4', type: 'STORE', storeId: '4', storeName: '신논현점', timestamp: '2026-01-13T14:15:00', severity: 'INFO', status: 'OPEN', message: 'OPEN 이벤트: 신규 오픈 매장 모니터링 필요', relatedData: { metricLabel: 'Status', value: 'New' } },
        { id: '5', type: 'POS', storeId: '5', storeName: '잠실롯데점', timestamp: '2026-01-13T09:10:00', severity: 'WARNING', status: 'RESOLVED', message: '식자재 발주 오류 감지', relatedData: { metricLabel: 'Order', value: 'Error' } }
    ];

    // Combine curated + random
    const allEvents = [...curatedEvents, ...events];

    return allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const MOCK_EVENTS = generateMockEvents();
