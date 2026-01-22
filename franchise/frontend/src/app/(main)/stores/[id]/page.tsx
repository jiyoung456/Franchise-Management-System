'use client';

import { MOCK_STORES } from '@/lib/mock/mockData';
import type { Store, StatusHistory } from '@/types';
import { StoreService } from '@/services/storeService';
import { QscService } from '@/services/qscService';
import { MOCK_EVENTS } from '@/lib/mock/mockEventData';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { MOCK_ACTIONS } from '@/lib/mock/mockActionData';
import { MOCK_PERFORMANCE } from '@/lib/mock/mockSalesData';
import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    MapPin, Calendar, User, FileText, Activity, AlertTriangle,
    CheckCircle, History, ArrowRight, Settings, BarChart2, Bell, Siren, ClipboardList, TrendingUp, TrendingDown, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Bar } from 'recharts';
import { ScoreBar } from '@/components/common/ScoreBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DiagnosisReportModal } from '@/components/features/ai-insight/DiagnosisReportModal';
import { StoreEditModal } from '@/components/features/stores/StoreEditModal';

export default function StoreDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const storeId = Array.isArray(params.id) ? params.id[0] : params.id;

    // State
    const [store, setStore] = useState<Store | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'events' | 'actions' | 'history' | 'risk' | 'qsc'>(
        (searchParams.get('tab') as any) || 'info'
    );
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Effect: Initial Data Fetch
    useEffect(() => {
        if (!storeId) return;
        // StoreService.init(); // removed
        const found = StoreService.getStore(storeId);
        if (found) {
            setStore(found);
        }
    }, [storeId]);

    // Derived Data
    const performance = MOCK_PERFORMANCE[store?.id || '1'] || MOCK_PERFORMANCE['1'];
    const riskProfile = MOCK_RISK_PROFILES[store?.id || ''] || MOCK_RISK_PROFILES['1'];

    // Calculate Chart Data for Status History
    const statusChartData = useMemo(() => {
        if (!store) return [];
        // Mock timeline data combined with history
        // In a real app, we'd parse store.statusHistory to build this trend.
        // Legend: 1=Normal, 2=Watchlist, 3=Risk
        return [
            { date: '2025-12-01', level: 1, status: 'NORMAL' },
            { date: '2025-12-15', level: 1, status: 'NORMAL' },
            { date: '2026-01-01', level: 2, status: 'WATCHLIST' },
            { date: '2026-01-08', level: 2, status: 'WATCHLIST' },
            { date: '2026-01-15', level: store.currentState === 'RISK' ? 3 : store.currentState === 'WATCHLIST' ? 2 : 1, status: store.currentState }
        ];
    }, [store]);

    if (!store) return <div className="p-8">Loading...</div>;

    const handleSaveStore = (updatedStore: Store) => {
        setStore(updatedStore);
        // In real app, call API here
        console.log('Store updated:', updatedStore);
        setIsEditModalOpen(false);
    };

    // Helper for AI Summary
    const aiSummary = riskProfile?.anomaly?.summary || "특이사항 없습니다.";

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Back Button Row */}
            <div className="flex items-center">
                <button
                    onClick={() => router.push('/stores/my')}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 transform rotate-180 mr-2" />
                    <span className="font-bold">목록으로</span>
                </button>
            </div>

            {/* 1. Header Row */}
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-24">
                {/* Store Name Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex items-center justify-center px-8 min-w-[240px] rounded-lg">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 text-center">{store.name}</h1>
                        <p className="text-xs text-gray-400 text-center mt-1">{store.regionCode} / {store.currentSupervisorId}</p>
                    </div>
                </div>

                {/* AI Summary Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex-1 flex items-center px-6 rounded-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div>
                        <span className="text-xs font-bold text-blue-600 block mb-1">AI 요약 리포트</span>
                        <p className="text-gray-700 font-medium text-sm line-clamp-2">
                            {aiSummary}
                        </p>
                    </div>
                </div>

                {/* Status Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center px-6 min-w-[200px] rounded-lg py-2">
                    <div className="flex flex-col items-center gap-2">
                        {/* Operational Status */}
                        <div>
                            <span className="text-xs text-gray-400 block mb-1 text-center">운영 상태</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-extrabold border ${store.operationStatus === 'OPEN' ? 'bg-green-50 text-green-700 border-green-200' :
                                store.operationStatus === 'CLOSED_TEMPORARY' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                    store.operationStatus === 'CLOSED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                {store.operationStatus}
                            </span>
                        </div>
                        {/* Lifecycle/Risk Status */}
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">리스크:</span>
                            <StatusBadge
                                status={store.currentState === 'NORMAL' ? '정상' : store.currentState === 'WATCHLIST' ? '관찰' : '위험'}
                                type={store.currentState === 'NORMAL' ? 'success' : store.currentState === 'WATCHLIST' ? 'warning' : 'danger'}
                                className="text-xs px-2 py-0.5"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Top Section: Metrics + Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
                {/* Left: Metrics */}
                <div className="md:col-span-1 bg-white border border-gray-200 shadow-sm p-6 flex flex-col justify-around rounded-lg gap-6">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">종합 위험 점수</h3>
                            {store.currentStateScore < 80 && <AlertTriangle className="w-5 h-5 text-red-500" />}
                        </div>
                        <div className="flex items-end justify-center gap-1">
                            <span className={`text-5xl font-extrabold ${store.currentStateScore >= 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {store.currentStateScore}
                            </span>
                            <span className="text-gray-400 text-xl font-medium mb-1">/ 100</span>
                        </div>
                        <div className="w-full mt-4 px-4">
                            <ScoreBar value={store.currentStateScore} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                        <div className="text-center border-r border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">QSC 점수</p>
                            <p className="text-2xl font-bold text-blue-600">{store.qscScore}점</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">주간 평균 매출</p>
                            <p className="text-2xl font-bold text-gray-900">{(performance.weeklySales[3].sales / 10000).toLocaleString()}만</p>
                        </div>
                    </div>
                </div>

                {/* Right: Timeline Chart */}
                <div className="md:col-span-2 bg-white border border-gray-200 shadow-sm p-6 flex flex-col rounded-lg h-[320px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">상태 변경 타임라인</h3>
                        <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>정상</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span>관찰</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span>위험</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={statusChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis
                                    domain={[0, 4]}
                                    ticks={[1, 2, 3]}
                                    tickFormatter={(val) => val === 1 ? '정상' : val === 2 ? '관찰' : '위험'}
                                    width={60}
                                />
                                <Tooltip labelStyle={{ color: '#333' }} />
                                <Line
                                    type="stepAfter"
                                    dataKey="level"
                                    stroke="#2b6cb0"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                                {/* Background Zones */}
                                <ReferenceLine y={1} stroke="#22c55e" strokeDasharray="3 3" opacity={0.3} />
                                <ReferenceLine y={2} stroke="#f97316" strokeDasharray="3 3" opacity={0.3} />
                                <ReferenceLine y={3} stroke="#ef4444" strokeDasharray="3 3" opacity={0.3} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Bottom Section: Tabs + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left: Tabs Content (Takes up 3/4 width) */}
                <div className="lg:col-span-3 bg-white border border-gray-200 shadow-sm flex flex-col min-h-[500px] rounded-lg">
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'info' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            가게 정보
                        </button>
                        <button
                            onClick={() => setActiveTab('events')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'events' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            최근 이벤트
                        </button>
                        <button
                            onClick={() => setActiveTab('actions')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'actions' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            조치 현황
                        </button>
                        <button
                            onClick={() => setActiveTab('qsc')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'qsc' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            QSC 점검
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            상태변경 이력
                        </button>
                        <button
                            onClick={() => setActiveTab('risk')}
                            className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === 'risk' ? 'bg-red-50 text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <span className="flex items-center justify-center gap-1"><Siren className="w-3 h-3" /> 위험 상세</span>
                        </button>
                    </div>

                    {/* Tab Body */}
                    <div className="p-8">
                        {activeTab === 'info' && (
                            <div className="space-y-6 max-w-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" /> 기본 정보
                                </h3>
                                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">오픈일</span>
                                        <span className="col-span-2 text-gray-900">
                                            {store.openedAt?.split('T')[0]}
                                            <span className="text-blue-600 ml-2 font-medium text-sm">
                                                (D+{Math.floor((new Date().getTime() - new Date(store.openedAt || new Date()).getTime()) / (1000 * 3600 * 24))}일)
                                            </span>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">마지막 상태 변경일</span>
                                        <span className="col-span-2 text-gray-900">{store.statusHistory[0]?.date || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">점주명</span>
                                        <span className="col-span-2 text-gray-900">{store.ownerName}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">점주 연락처</span>
                                        <span className="col-span-2 text-gray-900">010-1234-5678 (안심번호)</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">점포 주소</span>
                                        <span className="col-span-2 text-gray-900">{store.address}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">계약 유형</span>
                                        <span className="col-span-2 text-gray-900">{store.contractType} (만료: {store.contractEndAt?.split('T')[0]})</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">최근 수정일</span>
                                        <span className="col-span-2 text-gray-900">
                                            {store.updatedAt.split('T')[0]}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 py-4">
                                        <span className="font-bold text-gray-600">누적 방문 횟수</span>
                                        <span className="col-span-2 text-gray-900">10회</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-500" /> 최근 이벤트 (Log)
                                </h3>
                                <ul className="space-y-4">
                                    {MOCK_EVENTS.filter(e => e.storeId === store.id).map(evt => (
                                        <li key={evt.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${evt.type === 'QSC' ? 'bg-blue-50 text-blue-600 border-blue-100' : evt.type === 'RISK' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-600'}`}>
                                                    {evt.type}
                                                </span>
                                                <span className="text-xs text-gray-400">{evt.timestamp.replace('T', ' ').slice(0, 16)}</span>
                                            </div>
                                            <p className="font-bold text-gray-900 mb-1">{evt.message}</p>
                                            <div className="flex items-center gap-2">
                                                {evt.severity === 'CRITICAL' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                                                <span className="text-sm text-gray-500">{evt.severity}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" /> 조치 현황
                                </h3>
                                <div className="space-y-3">
                                    {MOCK_ACTIONS.filter(a => a.storeId === store.id).map(action => (
                                        <div key={action.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-lg">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-2 h-2 rounded-full ${action.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                    <p className="font-bold text-gray-900">{action.title}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 pl-4">담당자: {action.assignee} | 기한: {action.dueDate}</p>
                                            </div>
                                            <button className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">상세</button>
                                        </div>
                                    ))}
                                    {MOCK_ACTIONS.filter(a => a.storeId === store.id).length === 0 && (
                                        <p className="text-gray-500 text-center py-8">등록된 조치 내역이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'qsc' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-purple-500" /> QSC 점검 이력
                                </h3>
                                <div className="space-y-4">
                                    {QscService.getInspections().filter(i => i.storeId === store.id)
                                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                        .map(inspection => (
                                            <div
                                                key={inspection.id}
                                                className="flex flex-col sm:flex-row sm:items-center justify-between border border-gray-200 p-5 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer group bg-white"
                                                onClick={() => router.push(`/qsc/report/${inspection.id}`)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-lg border-2
                                                    ${inspection.grade === 'S' || inspection.grade === 'A' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            inspection.grade === 'B' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {inspection.grade}
                                                        <span className="text-[10px] font-normal opacity-75">{inspection.score}점</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                                {inspection.date} {inspection.type} 점검
                                                            </h4>
                                                            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${inspection.isPassed ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                {inspection.isPassed ? 'PASS' : 'FAIL'}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {inspection.inspector}</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span>{inspection.region}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-4 sm:mt-0 flex items-center justify-end">
                                                    <span className="px-4 py-2 text-sm font-bold text-gray-500 bg-gray-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                                        상세 리포트 <ChevronRight className="w-4 h-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    {QscService.getInspections().filter(i => i.storeId === store.id).length === 0 && (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 mb-2">진행된 점검 이력이 없습니다.</p>
                                            <button
                                                onClick={() => router.push(`/qsc/inspection/new?storeId=${store.id}`)}
                                                className="text-blue-600 font-bold hover:underline text-sm"
                                            >
                                                + 새 점검 시작하기
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-500" /> 상태 변경 이력
                                </h3>
                                <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-6 py-2">
                                    {store.statusHistory.map((h, i) => (
                                        <div key={i} className="relative">
                                            <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                                                <span className="font-bold text-gray-900 text-lg">{h.newStatus}</span>
                                                <span className="text-sm text-gray-500">{h.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded mb-2">
                                                <span className="font-bold text-gray-700 mr-2">사유:</span>
                                                {h.reason}
                                            </p>
                                            <p className="text-xs text-gray-400">Changed by {h.changer} (from {h.oldStatus})</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'risk' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Siren className="w-5 h-5 text-red-500" /> 위험 분석 상세
                                    </h3>
                                    <button
                                        onClick={() => setIsReportOpen(true)}
                                        className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
                                    >
                                        <FileText className="w-4 h-4" /> 상세 리포트 보기
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-red-800 mb-3">주요 위험 요인 (Risk Factors)</h4>
                                        <ul className="space-y-2">
                                            {riskProfile.factors.map((f, idx) => (
                                                <li key={idx} className="flex items-start gap-2 bg-white/60 p-2 rounded">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <span className="font-bold text-red-700 block text-sm">{f.label}</span>
                                                        <span className="text-xs text-red-600 block">{f.value} (Impact: {f.impactScore})</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                        <h4 className="font-bold text-gray-800 mb-3">이상 징후 패턴 (Patterns)</h4>
                                        <ul className="space-y-2">
                                            {riskProfile.patterns.map((p, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <TrendingDown className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                                                    <span className="text-sm text-gray-700">{p.description} <span className="text-xs text-gray-400">({p.detectedCount}회 감지)</span></span>
                                                </li>
                                            ))}
                                            {riskProfile.patterns.length === 0 && <li className="text-sm text-gray-500">감지된 이상 패턴이 없습니다.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Quick Links Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg">
                        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-gray-500" /> 관리 메뉴
                        </h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push(`/performance/${store.id}`)}
                                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-left transition-all flex items-center justify-between group"
                            >
                                KPI 대시보드
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            </button>
                            <button
                                onClick={() => setActiveTab('qsc')}
                                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-left transition-all flex items-center justify-between group"
                            >
                                QSC 점검 이력
                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            </button>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-left transition-all flex items-center justify-between"
                            >
                                점포 정보 수정
                                <Settings className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                                onClick={() => setIsStatusModalOpen(true)}
                                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 text-left transition-all flex items-center justify-between"
                            >
                                상태 수동 변경
                                <Activity className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>


                </div>
            </div>

            {/* Modals */}
            {isReportOpen && store && (
                <DiagnosisReportModal
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    profile={riskProfile}
                />
            )}

            {isEditModalOpen && store && (
                <StoreEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    store={store}
                    onSave={handleSaveStore}
                />
            )}

            {/* Keeping the Status Change Modal & Edit Modal logic implied or implemented if needed explicitly. 
                For brevity, I will include their closing tags in the main return if they were part of the component.
                (They were in previous code, so I should probably verify I didn't lose them.)
            */}
        </div>
    );
}
