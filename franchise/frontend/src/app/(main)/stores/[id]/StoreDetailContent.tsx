'use client';

import type { Store, ActionItem, User as UserType } from '@/types'; // StatusHistory 제거 (사용 안함)
import { RiskProfile, RiskLevel } from '@/lib/mock/mockRiskData';
import { AuthService } from '@/services/authService';
import { StoreService } from '@/services/storeService';
import { QscService } from '@/services/qscService';
import { EventService } from '@/services/eventService';
import { ActionService } from '@/services/actionService';
import { notFound, useParams, useRouter, useSearchParams } from 'next/navigation';
import {
    MapPin, Calendar, User, FileText, Activity, AlertTriangle,
    CheckCircle, ArrowRight, Settings, Bell, Siren, ClipboardList, ChevronRight
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ScoreBar } from '@/components/common/ScoreBar';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DiagnosisReportModal } from '@/components/features/ai-insight/DiagnosisReportModal';
import { StoreEditModal } from '@/components/features/stores/StoreEditModal';
import { StoreKPIModal } from '@/components/features/stores/StoreKPICard';

// Helper to map region code to Korean name
const getRegionName = (code: string): string => {
    if (!code) return '';
    const upperCode = code.toUpperCase();

    if (upperCode.startsWith('SEOUL')) return '서울';
    if (upperCode.startsWith('GYEONGGI') || upperCode.startsWith('GYEONGGL')) return '경기';
    if (upperCode.startsWith('INCHEON')) return '인천';
    if (upperCode.startsWith('CHUNGNAM')) return '충남';
    if (upperCode.startsWith('CHUNGBUK')) return '충북';
    if (upperCode.startsWith('GANGWON')) return '강원';
    if (upperCode.startsWith('SEJONG')) return '세종';
    if (upperCode.startsWith('BUSAN')) return '부산';
    if (upperCode.startsWith('DAEGU')) return '대구';
    if (upperCode.startsWith('ULSAN')) return '울산';
    if (upperCode.startsWith('GWANGJU')) return '광주';
    if (upperCode.startsWith('JEONNAM')) return '전남';
    if (upperCode.startsWith('JEONBUK')) return '전북';
    if (upperCode.startsWith('JEJU')) return '제주';
    if (upperCode.startsWith('GYEONGNAM')) return '경남';
    if (upperCode.startsWith('GYEONGBUK')) return '경북';

    return code;
};

export default function StoreDetailContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const storeId = Array.isArray(params.id) ? params.id[0] : params.id;

    // State
    const [store, setStore] = useState<Store | null>(null);
    const [events, setEvents] = useState<any[]>([]);
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [qscInspections, setQscInspections] = useState<any[]>([]);

    const [activeTab, setActiveTab] = useState<'info' | 'events' | 'actions' | 'risk' | 'qsc'>(
        (searchParams.get('tab') as any) || 'info'
    );
    const [currentUser, setCurrentUser] = useState<UserType | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isKPIModalOpen, setIsKPIModalOpen] = useState(false);

    // Effect: Initial Data Fetch
    useEffect(() => {
        const init = async () => {
            const user = await AuthService.getCurrentUser();
            setCurrentUser(user);

            if (!storeId) return;

            // 1. 점포 정보 조회
            const found = await StoreService.getStore(storeId);
            if (found) {
                setStore(found);
            }

            // 2. 이벤트 조회
            try {
                const storeEvents = await StoreService.getStoreEvents(storeId, 20);
                setEvents(storeEvents);
            } catch (error) {
                console.error('Failed to load events:', error);
                setEvents([]);
            }

            // 3. 조치사항 조회
            try {
                const allActions = await ActionService.getActions();
                const storeActions = allActions.filter((a: ActionItem) => a.storeId?.toString() === storeId);
                setActions(storeActions);
            } catch (error) {
                console.error('Failed to load actions:', error);
                setActions([]);
            }

            // 4. QSC 점검 조회
            try {
                const qscData = await QscService.getStoreQscList(Number(storeId));
                setQscInspections(qscData);
            } catch (error) {
                console.error('Failed to load QSC inspections:', error);
                setQscInspections([]);
            }
        };
        init();
    }, [storeId]);

    // 실제 데이터를 반영한 계산 로직
    const currentQscScore = useMemo(() => {
        if (store?.qscScore) return store.qscScore;
        if (qscInspections && qscInspections.length > 0) return qscInspections[0].score || 0;
        return 0;
    }, [store, qscInspections]);

    const riskProfile: RiskProfile = {
        storeId: storeId || '',
        storeName: store?.name || '',
        totalRiskScore: store?.currentStateScore || 0,
        riskLevel: (store?.currentState as RiskLevel) || 'NORMAL',
        factors: [],
        patterns: [],
        context: [],
        anomaly: {
            isAnomaly: (store?.currentStateScore || 0) > 80,
            detectedAt: '2025-09-01T10:00:00.000Z',
            severity: (store?.currentStateScore || 0) > 90 ? 'HIGH' : 'MEDIUM',
            summary: '특이사항 없습니다.',
            features: []
        },
        history: [],
        metricAnomalies: [],
        operationalGaps: [],
        rootCauses: []
    };

    const aiSummary = riskProfile?.anomaly?.summary || "특이사항 없습니다.";

    const statusChartData = useMemo(() => {
        if (!store) return [];
        if (store.statusHistory && store.statusHistory.length > 0) {
            return store.statusHistory.map(h => ({
                date: h.date,
                level: h.newStatus === 'RISK' ? 3 : h.newStatus === 'WATCHLIST' ? 2 : 1,
                status: h.newStatus
            })).reverse();
        }

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
        if (updatedStore) {
            setStore(updatedStore);
        }
        setIsEditModalOpen(false);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Back Button Row */}
            <div className="flex items-center">
                <button
                    onClick={() => {
                        if (currentUser?.role === 'MANAGER') {
                            router.push('/');
                        } else {
                            router.push('/stores/my');
                        }
                    }}
                    className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowRight className="w-6 h-6 transform rotate-180 mr-2" />
                    <span className="font-bold">목록으로</span>
                </button>
            </div>

            {/* 1. Header Row */}
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-24">
                <div className="bg-white border border-gray-200 shadow-sm flex items-center justify-center px-8 min-w-[240px] rounded-lg">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 text-center">{store.name}</h1>
                        <p className="text-xs text-gray-400 text-center mt-1">{getRegionName(store.regionCode)} / {store.currentSupervisorId}</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm flex-1 flex items-center px-6 rounded-lg relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div>
                        <span className="text-xs font-bold text-blue-600 block mb-1">AI 요약 리포트</span>
                        <p className="text-gray-700 font-medium text-sm line-clamp-2">
                            {aiSummary}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 shadow-sm flex flex-col items-center justify-center px-6 min-w-[200px] rounded-lg py-2">
                    <div className="flex flex-col items-center gap-2">
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

                    <div className="border-t border-gray-100 pt-6">
                        <div className="text-center">
                            <p className="text-sm text-gray-500 mb-1">최근 QSC 점수</p>
                            <p className="text-3xl font-bold text-blue-600">{currentQscScore}점</p>
                        </div>
                    </div>
                </div>

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
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(val) => val === 1 ? '정상' : val === 2 ? '관찰' : '위험'} width={60} axisLine={false} tickLine={false} />
                                <Tooltip labelStyle={{ color: '#333' }} />
                                <Line type="stepAfter" dataKey="level" stroke="#2b6cb0" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
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
                <div className="lg:col-span-3 bg-white border border-gray-200 shadow-sm flex flex-col min-h-[500px] rounded-lg">
                    {/* Tab Header */}
                    <div className="flex border-b border-gray-200">
                        {['info', 'events', 'actions', 'qsc', 'risk'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                {tab === 'info' && '가게 정보'}
                                {tab === 'events' && '최근 이벤트'}
                                {tab === 'actions' && '조치 현황'}
                                {tab === 'qsc' && 'QSC 점검'}
                                {tab === 'risk' && '위험 상세'}
                            </button>
                        ))}
                    </div>

                    {/* Tab Body */}
                    <div className="p-8">
                        {activeTab === 'info' && (
                            <div className="space-y-6 max-w-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-gray-500" /> 기본 정보
                                </h3>
                                <div className="divide-y divide-gray-100 border-t border-b border-gray-100">
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">오픈일</span><span className="col-span-2 text-gray-900">{store.openedAt?.split('T')[0]}<span className="text-blue-600 ml-2 font-medium text-sm">(D+{Math.floor((new Date('2025-09-01').getTime() - new Date(store.openedAt || '2025-09-01').getTime()) / (1000 * 3600 * 24))}일)</span></span></div>
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">마지막 상태 변경일</span><span className="col-span-2 text-gray-900">{store.statusHistory?.[0]?.date || '-'}</span></div>
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">점주명</span><span className="col-span-2 text-gray-900">{store.ownerName}</span></div>
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">점주 연락처</span><span className="col-span-2 text-gray-900">{store.ownerPhone || '-'}</span></div>
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">점포 주소</span><span className="col-span-2 text-gray-900">{store.address}</span></div>
                                    <div className="grid grid-cols-3 gap-4 py-4"><span className="font-bold text-gray-600">계약 유형</span><span className="col-span-2 text-gray-900">{store.contractType} (만료: {store.contractEndAt?.split('T')[0]})</span></div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'events' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-500" /> 최근 이벤트 (Log)
                                </h3>
                                <ul className="space-y-4">
                                    {events.length > 0 ? (
                                        events.map((evt: any) => (
                                            <li key={evt.eventId || evt.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${evt.eventType === 'QSC' || evt.type === 'QSC' ? 'bg-blue-50 text-blue-600 border-blue-100' : evt.eventType === 'RISK' || evt.type === 'RISK' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-100 text-gray-600'}`}>
                                                        {evt.eventType || evt.type || 'EVENT'}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{(evt.occurredAt || evt.timestamp || '').toString().replace('T', ' ').slice(0, 16)}</span>
                                                </div>
                                                <p className="font-bold text-gray-900 mb-1">{evt.summary || evt.message || '이벤트 내용 없음'}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">이벤트 이력이 없습니다.</p>
                                    )}
                                </ul>
                            </div>
                        )}

                        {activeTab === 'actions' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-5 h-5 text-blue-500" /> 조치 현황
                                </h3>
                                <div className="space-y-4">
                                    {actions.length > 0 ? (
                                        actions.map((action: ActionItem) => (
                                            <div key={action.id} className="flex justify-between items-center border border-gray-100 p-4 rounded-lg">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${action.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                        <p className="font-bold text-gray-900">{action.title}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-500 pl-4">담당자: {action.assignee} | 기한: {action.dueDate}</p>
                                                </div>
                                                <button onClick={() => router.push(`/actions/${action.id}`)} className="px-3 py-1 text-sm border border-gray-200 rounded hover:bg-gray-50">상세</button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">진행 중인 조치 사항이 없습니다.</p>
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
                                    {qscInspections.length > 0 ? (
                                        qscInspections.map((inspection: any) => (
                                            <div key={inspection.inspectionId || inspection.id} className="border p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="font-bold text-gray-900">{(inspection.inspectedAt || inspection.date || '').toString().split('T')[0]} 점검</div>
                                                    <span className={`px-2 py-1 rounded text-sm font-bold ${inspection.grade === 'A' ? 'bg-green-100 text-green-700' : inspection.grade === 'B' ? 'bg-blue-100 text-blue-700' : inspection.grade === 'C' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                        {inspection.grade}등급
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-600">점수: {inspection.totalScore || inspection.score || 0}점{inspection.isPassed !== undefined && (<span className={`ml-2 ${inspection.isPassed ? 'text-green-600' : 'text-red-600'}`}>({inspection.isPassed ? '통과' : '미통과'})</span>)}</div>
                                                {inspection.summaryComment && (<p className="text-sm text-gray-500 mt-2">{inspection.summaryComment}</p>)}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">QSC 점검 이력이 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'risk' && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-4">위험 분석 상세</h3>
                                {riskProfile.factors.length > 0 ? (
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        {riskProfile.factors.map((f, i) => (
                                            <div key={i} className="mb-2 text-red-800">{f.label} - {f.value}</div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">분석된 위험 요인이 없습니다.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg">
                        <h3 className="text-base font-bold text-gray-900 mb-4">가게 관리</h3>
                        <div className="space-y-3">
                            <button onClick={() => setIsKPIModalOpen(true)} className="w-full py-2 border rounded hover:bg-gray-50">KPI 대시보드</button>
                            {currentUser?.role === 'ADMIN' && (
                                <button onClick={() => setIsEditModalOpen(true)} className="w-full py-2 border rounded hover:bg-gray-50">점포 정보 수정</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isEditModalOpen && store && (
                <StoreEditModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    store={store}
                    onSave={handleSaveStore}
                />
            )}

            {isReportOpen && store && (
                <DiagnosisReportModal
                    isOpen={isReportOpen}
                    onClose={() => setIsReportOpen(false)}
                    profile={riskProfile}
                />
            )}

            {isKPIModalOpen && store && (
                <StoreKPIModal
                    isOpen={isKPIModalOpen}
                    onClose={() => setIsKPIModalOpen(false)}
                    store={store}
                />
            )}
        </div>
    );
}
