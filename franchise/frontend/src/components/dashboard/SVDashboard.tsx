'use client';

import React, { useState, useEffect } from 'react';
import {
    ChevronRight,
    X,
    AlertCircle,
    ClipboardCheck,
    Building2,
    TrendingDown,
    Siren,
    MoreHorizontal,
    FileText,
    UserCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    Zap,
    MapPin,
    ArrowLeft,
    LayoutDashboard,
    Calendar,
    User
} from 'lucide-react';
import { DashboardService } from '@/services/dashboardService';
import { SupervisorDashboardSummary, User as UserType } from '@/types';

// --- Types (Local) ---
interface SvRiskStore {
  storeId: number;
  storeName: string;
  state: 'NORMAL' | 'WATCHLIST' | 'RISK';
  region: string;
  supervisor: string;
  qscScore: number;
  lastInspectionDate: string | null;
  currentStateScore: number;
}


interface ChecklistItem {
    id: string;
    label: string;
    risk: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    checked: boolean;
    priority?: 'HIGH' | 'MEDIUM' | 'LOW'; // Added to match Manager Briefing style
}

// --- MOCK DATA ---
const MOCK_RISK_STORES: SvRiskStore[] = [
    {
        id: 101,
        name: '강남구청점',
        riskLevel: 'HIGH',
        reason: '매출 급락 (-25%) 및 위생 점검 미흡',
        action: '긴급 방문',
        score: 65,
        category: 'OPERATION',
        owner: '김지훈',
        openDate: '2021-01-10',
        address: '서울 강남구 학동로 343'
    },
    {
        id: 102,
        name: '역삼2호점',
        riskLevel: 'HIGH',
        reason: '고객 클레임 3건 발생 (품질 불만)',
        action: '재점검',
        score: 72,
        category: 'QSC',
        owner: '이민수',
        openDate: '2022-05-15',
        address: '서울 강남구 테헤란로 212'
    },
    {
        id: 103,
        name: '삼성중앙점',
        riskLevel: 'MEDIUM',
        reason: '재고 관리 데이터 이상 감지',
        action: '유선 확인',
        score: 78,
        category: 'POS',
        owner: '박서연',
        openDate: '2020-11-20',
        address: '서울 강남구 봉은사로 404'
    },
];

const MOCK_CHECKLIST: ChecklistItem[] = [
    { id: 'c1', label: '강남역점 긴급 위생 점검', risk: 'HIGH', priority: 'HIGH', checked: false },
    { id: 'c2', label: '2025 상반기 정기 점검 템플릿 승인', risk: 'HIGH', priority: 'HIGH', checked: false },
    { id: 'c3', label: '역삼점 매출 하락 원인 분석 리포트 확인', risk: 'MEDIUM', priority: 'MEDIUM', checked: false },
    { id: 'c4', label: '부산 지역 신규 매장 방문 일정 조율', risk: 'LOW', priority: 'LOW', checked: true },
];

const MOCK_SUMMARY_COUNTS = {
    totalIssues: 5,
    urgent: 2,
    waiting: 2,
    riskStoreToday: 4
};

// --- SUBSIDIARY COMPONENTS ---

const RiskStoreCard = ({ store, onOpenReport }: { store: SvRiskStore; onOpenReport: (s: SvRiskStore) => void }) => {
    // Risk Badge Colors matches the reference image style
    const badgeColor = store.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' :
        store.riskLevel === 'MEDIUM' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600';

    const Icon = store.category === 'QSC' ? ClipboardCheck : store.category === 'POS' ? TrendingDown : Siren;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow h-full">
            <div>
                {/* Header: Risk Badge & Icon */}
                <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${badgeColor}`}>
                        {store.riskLevel === 'HIGH' ? '심각' : store.riskLevel === 'MEDIUM' ? '주의' : '관찰'}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                        <Icon className="w-4 h-4" />
                    </div>
                </div>

                {/* Body: Store Name & Reason */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">{store.storeName}</h3>

                {/* Content Box */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <p className="text-sm font-semibold text-gray-700 leading-relaxed">
                      위험점수 {store.currentStateScore}점
                      <br />
                      최근점검 {store.lastInspectionDate ?? '-'}
                    </p>
                </div>

                <div className="flex items-center text-xs font-bold text-gray-400 mb-6 uppercase tracking-wider">
                    <span className="mr-2">CATEGORY</span>
                    <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{store.category || 'OPERATION'}</span>
                </div>
            </div>

            {/* Footer: Action Button (Blue) */}
            <button
                onClick={() => onOpenReport(store)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors"
            >
                리포트 보기
            </button>
        </div>
    );
};

// Report Drawer Component
const ReportDrawer = ({
    isOpen,
    onClose,
    store
}: {
    isOpen: boolean;
    onClose: () => void;
    store: SvRiskStore | null
}) => {
    const [activeTab, setActiveTab] = useState('INFO');

    useEffect(() => {
        if (isOpen) setActiveTab('INFO');
    }, [isOpen]);

    if (!isOpen || !store) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative w-full max-w-lg bg-gray-50 h-full shadow-2xl overflow-y-auto animate-slide-in-right flex flex-col">
                {/* 1. Header (Back Button) */}
                <div className="bg-white px-6 py-4 flex items-center border-b border-gray-100">
                    <button
                        onClick={onClose}
                        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-5 h-5 mr-1" />
                        목록으로
                    </button>
                    <div className="flex-1" />
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">

                    {/* Header Card */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1">{store.name}</h2>
                            <p className="text-sm text-gray-400 font-medium">서울 / sv01</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                            <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-xs font-bold border border-green-100">
                                OPEN
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${store.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                리스크: {store.riskLevel === 'HIGH' ? '위험' : store.riskLevel}
                            </span>
                        </div>
                    </div>

                    {/* AI Summary Banner */}
                    <div className="bg-white rounded-xl p-4 border border-blue-100 shadow-sm flex items-center relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        <div className="pl-3">
                            <p className="text-xs font-bold text-blue-500 mb-1">AI 요약 리포트</p>
                            <p className="text-sm text-gray-700 font-medium">
                                특이사항: {store.reason}
                            </p>
                        </div>
                    </div>

                    {/* Metrics Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
                            <p className="text-xs font-bold text-gray-500 mb-2">종합 위험 점수</p>
                            <div className="flex items-end justify-center mb-2">
                                <span className="text-4xl font-bold text-green-500 leading-none">98</span>
                                <span className="text-sm text-gray-400 mb-1 ml-1">/ 100</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                                <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center flex flex-col justify-center">
                            <p className="text-xs font-bold text-gray-500 mb-1">최근 QSC 점수</p>
                            <span className="text-3xl font-bold text-blue-600">96점</span>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900 text-sm">상태 변경 타임라인</h3>
                            <div className="flex space-x-2 text-[10px]">
                                <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1"></span>정상</span>
                                <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-orange-400 mr-1"></span>관찰</span>
                                <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1"></span>위험</span>
                            </div>
                        </div>
                        <div className="h-24 flex items-end justify-between px-2 relative text-xs text-gray-400 border-l border-b border-gray-100 pb-2">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-100 -z-10"></div>
                            <div className="flex flex-col items-center z-10">
                                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white mb-2"></span>
                                2025-12
                            </div>
                            <div className="flex flex-col items-center z-10">
                                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white mb-2"></span>
                                2026-01
                            </div>
                            <div className="flex flex-col items-center z-10">
                                <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-white mb-2"></span>
                                Today
                            </div>
                        </div>
                    </div>

                    {/* Tabs & Content */}
                    <div>
                        <div className="flex border-b border-gray-200 bg-white px-2 rounded-t-xl">
                            {['INFO', 'EVENT', 'ACTION', 'QSC'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                            ? 'text-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab === 'INFO' && '가게 정보'}
                                    {tab === 'EVENT' && '최근 이벤트'}
                                    {tab === 'ACTION' && '조치 현황'}
                                    {tab === 'QSC' && 'QSC 점검'}
                                    {activeTab === tab && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white p-5 rounded-b-xl border border-t-0 border-gray-200 shadow-sm min-h-[200px]">
                            {activeTab === 'INFO' && (
                                <div className="space-y-6">
                                    <div className="flex items-center text-sm font-bold text-gray-900">
                                        <FileText className="w-4 h-4 mr-2" />
                                        기본 정보
                                    </div>
                                    <dl className="grid grid-cols-3 gap-y-4 text-sm">
                                        <dt className="text-gray-500 col-span-1 font-medium">오픈일</dt>
                                        <dd className="text-blue-600 col-span-2 font-medium">
                                            {store.openDate || '2021-01-10'} (D+1853일)
                                        </dd>

                                        <dt className="text-gray-500 col-span-1 font-medium">마지막 상태 변경일</dt>
                                        <dd className="text-gray-900 col-span-2">-</dd>

                                        <dt className="text-gray-500 col-span-1 font-medium">점주명</dt>
                                        <dd className="text-gray-900 col-span-2">{store.owner || '김지훈'}</dd>

                                        <dt className="text-gray-500 col-span-1 font-medium">주소</dt>
                                        <dd className="text-gray-900 col-span-2">{store.address || '서울 강남구'}</dd>
                                    </dl>
                                </div>
                            )}
                            {activeTab !== 'INFO' && (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                                    <p>해당 탭의 정보가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Store Management Section Removed */}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function SVDashboard({ user }: { user: UserType }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SupervisorDashboardSummary | null>(null);

    // Local UI State
    const [riskStores, setRiskStores] = useState<SvRiskStore[]>([]);
    const [checklist, setChecklist] = useState<ChecklistItem[]>(MOCK_CHECKLIST);
    const [summaryCounts, setSummaryCounts] = useState(MOCK_SUMMARY_COUNTS);

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedDrawerStore, setSelectedDrawerStore] = useState<SvRiskStore | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const dashboardSummary = await DashboardService.getSvDashboard(user.loginId);
                const stores = await DashboardService.getSvRiskStores(3);
                setRiskStores(stores);
                setData(dashboardSummary);
            } catch (err) {
                console.error("Failed to fetch SV dashboard data, using full mock", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const handleOpenReport = async (store: SvRiskStore) => {
      const report = await DashboardService.getRiskReport(store.storeId);
      console.log(report); // ← 먼저 콘솔 확인

      setSelectedDrawerStore({
        ...store,
        report // 나중에 Drawer에서 사용
      });

      setIsDrawerOpen(true);
    };


    const handleCloseReport = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedDrawerStore(null), 300);
    };

    const toggleCheck = (id: string) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ));
    };

    // Calculate unchecked count
    const uncheckedCount = checklist.filter(c => !c.checked).length;

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="pb-24 space-y-10"> {/* Updated Container to match ManagerDashboard */}
            <style dangerouslySetInnerHTML={{
                __html: `
            @keyframes slide-in-right {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slide-in-right {
              animation: slide-in-right 0.3s ease-out forwards;
            }
          `}} />

            {/* Header Area Matched with ManagerDashboard */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                        슈퍼바이저 대시보드
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        반갑습니다, <span className="text-[#1a73e8] font-bold">{user.userName}</span> SV님. 오늘의 핵심 매장 지표를 분석했습니다.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>2025년 9월 1일 (월)</span>
                    </div>
                </div>
            </div>

            {/* Content Section Matched with ManagerDashboard structure */}
            <div className="space-y-12">
                {/* 1. Today's Urgent Stores (Matched Animation Section) */}
                <section className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">오늘 확인이 필요한 매장</h2>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {riskStores.map((store) => (
                            <RiskStoreCard
                                key={store.storeId}
                                store={store}
                                onOpenReport={handleOpenReport}
                            />
                        ))}
                    </div>
                </section>

                {/* 2. Bottom Area: Wrapped in the exact same container as ManagerDashboard's BriefingWidget */}
                <section className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                    <div className="w-full space-y-6">
                        {/* Title matching BriefingWidget style */}
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-xl font-bold text-gray-900">오늘의 할 일</h2>
                            <span className="text-sm text-gray-500 font-medium px-2 py-1 bg-gray-100 rounded-lg">2026-02-06</span>
                        </div>

                        {/* Two Columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            {/* Left: Checklist */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    체크리스트 (Checklist)
                                    <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-bold ml-auto">
                                        미완료 {uncheckedCount}건
                                    </span>
                                </h3>

                                <div className="space-y-3 flex-1 overflow-y-auto">
                                    {checklist.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleCheck(item.id)}
                                            className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer group hover:shadow-md ${item.checked
                                                ? 'bg-gray-50 border-gray-100'
                                                : 'bg-white border-gray-200 hover:border-blue-400'
                                                }`}
                                        >
                                            <button className={`mt-0.5 flex-shrink-0 transition-colors ${item.checked ? 'text-gray-400' : 'text-gray-300 group-hover:text-blue-600'}`}>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.checked ? 'border-gray-400 bg-gray-400 text-white' : 'border-gray-300'}`}>
                                                    {item.checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                            </button>
                                            <div className="flex-1">
                                                <p className={`text-base font-bold leading-tight ${item.checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                    {item.label}
                                                </p>
                                                {/* Priority/Risk Badge matching Manager Briefing */}
                                                <div className="flex gap-2 mt-2.5">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border ${item.risk === 'HIGH' ? 'border-red-100 text-red-600 bg-red-50' :
                                                            item.risk === 'MEDIUM' ? 'border-orange-100 text-orange-600 bg-orange-50' :
                                                                'border-blue-100 text-blue-600 bg-blue-50'
                                                        }`}>
                                                        {item.risk}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right: Summary */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col h-full">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900 mb-4 pb-2 border-b border-gray-100">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                    운영 요약 (Summary)
                                </h3>

                                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex-1 flex flex-col justify-center">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="p-3 bg-white rounded-full shadow-sm">
                                            <User className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-gray-900 mb-1">{user.userName} SV님,</p>
                                            <p className="text-base text-gray-700 leading-relaxed font-medium">
                                                오늘 강남권역의 리스크 점수가 전일 대비 <span className="font-bold text-red-600">15% 상승</span>했습니다.
                                                특히 '강남역점'의 위생 등급 하락 리스크가 감지되어 긴급 점검이 필요합니다.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Mini Metrics */}
                                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200/50">
                                        <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <div className="text-xs font-bold text-gray-500 mb-1">총 이슈</div>
                                            <div className="text-xl font-extrabold text-gray-900">{summaryCounts.totalIssues}</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <div className="text-xs font-bold text-gray-500 mb-1">심각</div>
                                            <div className="text-xl font-extrabold text-red-600">{summaryCounts.urgent}</div>
                                        </div>
                                        <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <div className="text-xs font-bold text-gray-500 mb-1">승인 대기</div>
                                            <div className="text-xl font-extrabold text-blue-600">{summaryCounts.waiting}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Drawer Overlay */}
            <ReportDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseReport}
                store={selectedDrawerStore}
            />
        </div>
    );
}
