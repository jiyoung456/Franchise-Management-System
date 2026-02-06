import { AlertCircle, TrendingDown, ClipboardList, Info, ArrowRight } from 'lucide-react';

interface UrgentEvent {
    id: string;
    storeName: string;
    category: 'POS' | 'QSC' | 'OPERATION';
    eventName: string;
    riskLevel: 'CRITICAL' | 'WARNING';
}

const MOCK_EVENTS: UrgentEvent[] = [
    {
        id: 'EV-001',
        storeName: '강남역점',
        category: 'POS',
        eventName: '마진율 하락(-15% 이하) 감지',
        riskLevel: 'CRITICAL'
    },
    {
        id: 'EV-002',
        storeName: '미아점',
        category: 'OPERATION',
        eventName: 'SV 방문 공백 60일 이상 감지',
        riskLevel: 'CRITICAL'
    },
    {
        id: 'EV-003',
        storeName: '논현점',
        category: 'QSC',
        eventName: 'QSC 총점 하락(>= 5점) - WATCH 등급',
        riskLevel: 'WARNING'
    }
];

interface UrgentEventCardsProps {
    onViewReport: (id: string, type: 'EVENT' | 'ACTION') => void;
}

export function UrgentEventCards({ onViewReport }: UrgentEventCardsProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 px-1">오늘 확인이 필요한 이벤트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_EVENTS.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase
                                ${event.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                {event.riskLevel === 'CRITICAL' ? '심각' : '주의'}
                            </span>
                            <div className={`p-2 rounded-xl ${event.category === 'POS' ? 'bg-blue-50 text-blue-600' : event.category === 'QSC' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                {event.category === 'POS' ? <TrendingDown className="w-4 h-4" /> : event.category === 'QSC' ? <ClipboardList className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{event.storeName}</h3>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-[13px] font-bold text-slate-700 leading-snug">
                                    {event.eventName}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{event.category}</span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={() => onViewReport(event.id, 'ACTION')}
                                className="w-full py-2.5 bg-[#1a73e8] text-white rounded-xl text-[11px] font-bold hover:bg-[#1557b0] transition-all shadow-md shadow-blue-100 active:scale-95"
                            >
                                조치 생성
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
