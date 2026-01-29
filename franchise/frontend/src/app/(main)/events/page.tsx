'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, Filter, AlertCircle, CheckCircle2, Siren, ChevronRight, Info } from 'lucide-react';
import { EventService } from '@/services/eventService';
import { EventLog } from '@/types';
import { EventRuleGuideModal } from '@/components/features/events/EventRuleGuideModal';

export default function EventManagementPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [events, setEvents] = useState<EventLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setIsLoading(true);
                const data = await EventService.getEvents(); 
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const filteredEvents = events
        .filter(evt => {
            if (!evt) return false;
            
            const storeName = evt.storeName || '';
            const matchesSearch = storeName.includes(searchTerm);
            
            if (filterStatus === 'ALL') return matchesSearch;

            let matchesFilter = false;
            switch (filterStatus) {
                case '미처리':
                    matchesFilter = evt.status === 'OPEN';
                    break;
                case '위험':
                    matchesFilter = evt.severity === 'CRITICAL'; 
                    break;
                case '조치필요':
                    matchesFilter = evt.status === 'ACKNOWLEDGED';
                    break;
                case '완료':
                    matchesFilter = evt.status === 'RESOLVED';
                    break;
                default:
                    matchesFilter = true;
            }

            return matchesFilter && matchesSearch;
        })
        .sort((a, b) => {
             // [수정] occurredAt 제거 -> timestamp 사용
             const dateA = new Date(a.timestamp || 0).getTime();
             const dateB = new Date(b.timestamp || 0).getTime();
             return dateB - dateA;
        });

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
            case 'WARNING': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'INFO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200';
            case 'ACKNOWLEDGED': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
            case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
            default: return 'bg-gray-100 text-gray-600 ring-1 ring-gray-200';
        }
    };

    const getEventTypeIcon = (type: string) => {
        switch (type) {
            case 'QSC': return <CheckCircle2 className="w-4 h-4" />;
            case 'RISK': return <Siren className="w-4 h-4" />;
            case 'POS': return <AlertCircle className="w-4 h-4" />;
            default: return <Info className="w-4 h-4" />;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CRITICAL': return 'border-l-4 border-l-red-500';
            case 'WARNING': return 'border-l-4 border-l-orange-500';
            default: return 'border-l-4 border-l-gray-200';
        }
    };

    return (
        <div className="pb-24 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">이벤트 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">각 점포에서 발생한 특이사항 및 이슈를 실시간으로 모니터링합니다.</p>
                </div>
                <button
                    onClick={() => setIsGuideOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                >
                    <Info className="w-4 h-4 text-blue-500" />
                    이벤트 발생 기준 안내
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-white to-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-gray-600 font-bold text-sm">OPEN 이벤트</h3>
                            <p className="text-xs text-blue-400 mt-1 font-medium">실시간 미처리 건수</p>
                        </div>
                        <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900 tracking-tight">
                            {events.filter(e => e.status === 'OPEN').length}
                        </span>
                        <span className="text-sm font-bold text-gray-500">건</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-red-50/50 p-6 rounded-2xl border border-red-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-gray-600 font-bold text-sm">CRITICAL 위험</h3>
                            <p className="text-xs text-red-400 mt-1 font-medium">즉시 조치 필요</p>
                        </div>
                        <div className="p-2.5 bg-red-100 text-red-600 rounded-xl shadow-sm">
                            <Siren className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-red-600 tracking-tight">
                            {events.filter(e => e.severity === 'CRITICAL').length}
                        </span>
                        <span className="text-sm font-bold text-gray-500">건</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-orange-50/50 p-6 rounded-2xl border border-orange-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-gray-600 font-bold text-sm">조치 진행중</h3>
                            <p className="text-xs text-orange-400 mt-1 font-medium">팔로우업 필요</p>
                        </div>
                        <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl shadow-sm">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-orange-500 tracking-tight">
                            {events.filter(e => e.status === 'ACKNOWLEDGED').length}
                        </span>
                        <span className="text-sm font-bold text-gray-500">건</span>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 px-4 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        className="flex-1 border-none focus:ring-0 text-sm placeholder-gray-400 outline-none"
                        placeholder="점포명 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2 px-4 min-w-[200px]">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        className="flex-1 border-none focus:ring-0 text-sm text-gray-700 font-medium outline-none cursor-pointer bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">전체 상태</option>
                        <option value="미처리">미처리</option>
                        <option value="위험">위험</option>
                        <option value="조치필요">조치필요</option>
                        <option value="완료">완료</option>
                    </select>
                </div>
            </div>

            {/* Event List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500">로딩 중...</div>
                ) : (
                    <>
                        {filteredEvents.map(evt => (
                            <div
                                key={evt.id}
                                className={`group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer ${getSeverityColor(evt.severity || 'INFO')}`}
                                onClick={() => router.push(`/events/${evt.id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${getSeverityBadge(evt.severity || 'INFO')}`}>
                                                {getEventTypeIcon(evt.type)}
                                                {evt.severity || 'INFO'}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {evt.storeName}
                                            </h3>
                                            <span className="text-sm text-gray-300">|</span>
                                            <span className="text-sm font-medium text-gray-500">{evt.type} 이슈</span>
                                        </div>
                                        <div className="ml-1">
                                            {/* [수정] content/title 제거 -> message 사용 */}
                                            <p className="text-sm text-gray-600 line-clamp-1">{evt.message}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
                                                {/* [수정] occurredAt 제거 -> timestamp 사용 */}
                                                <span>발생: {(evt.timestamp || '').replace('T', ' ').slice(0, 16)}</span>
                                                {evt.relatedData?.metricLabel && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="font-medium text-gray-600">{evt.relatedData.metricLabel}: {evt.relatedData.value}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pl-4 md:border-l border-gray-100">
                                        <div className="text-right hidden md:block">
                                            <div className="text-xs text-gray-400 mb-1">Status</div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(evt.status)}`}>
                                                {evt.status}
                                            </span>
                                        </div>
                                        <div className="md:hidden">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(evt.status)}`}>
                                                {evt.status}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredEvents.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Search className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">검색된 이벤트가 없습니다.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <EventRuleGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
        </div>
    );
}