import { useEffect, useState } from 'react';
import { AlertCircle, TrendingDown, ClipboardList, Info, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface UrgentEvent {
    id: string;
    storeId: number;
    storeName: string;
    issueType: string;
    summary: string;
    riskLevel?: 'CRITICAL' | 'WARNING';
    supervisorName?: string;
}

interface UrgentEventCardsProps {
    onViewReport: (id: string, type: 'EVENT' | 'ACTION', svName?: string, summary?: string, eventId?: string) => void;
}

export function UrgentEventCards({ onViewReport }: UrgentEventCardsProps) {
    const [events, setEvents] = useState<UrgentEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/events');

                // API 응답 형식이 { data: [...] } 인지 아니면 바로 [...] 인지 확인
                const rawData = response.data.data || response.data;

                if (Array.isArray(rawData)) {
                    // 최신 이벤트 3개만 추출
                    const latestEvents = rawData.slice(0, 3).map((item: any) => ({
                        id: String(item.id || item.eventId),
                        storeId: item.storeId,
                        storeName: item.storeName,
                        issueType: item.issueType || item.type,
                        summary: item.summary || item.message,
                        riskLevel: item.riskLevel || (item.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING'),
                        supervisorName: item.assignedToUserName || item.supervisorName || item.supervisor || ''
                    }));
                    setEvents(latestEvents);
                } else {
                    console.error('Expected array but got:', rawData);
                    setEvents([]);
                }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch events:', err);
                setError('이벤트를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm text-slate-500">이벤트를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-red-50 rounded-2xl border border-red-100 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                <p className="text-sm font-medium text-slate-500">현재 확인이 필요한 이벤트가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 px-1">오늘 확인이 필요한 이벤트</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase
                                ${event.riskLevel === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                {event.riskLevel === 'CRITICAL' ? '심각' : '주의'}
                            </span>
                            <div className={`p-2 rounded-xl ${event.issueType === 'POS' ? 'bg-blue-50 text-blue-600' : event.issueType === 'QSC' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'}`}>
                                {event.issueType === 'POS' ? <TrendingDown className="w-4 h-4" /> : event.issueType === 'QSC' ? <ClipboardList className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{event.storeName}</h3>
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                <p className="text-[13px] font-bold text-slate-700 leading-snug">
                                    {event.summary}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</span>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{event.issueType}</span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button
                                onClick={() => onViewReport(String(event.storeId), 'ACTION', event.supervisorName, event.summary, event.id)}
                                className="w-full py-2.5 bg-[#1a73e8] text-white rounded-xl text-[11px] font-bold hover:bg-[#1557b0] shadow-md shadow-blue-100"
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

