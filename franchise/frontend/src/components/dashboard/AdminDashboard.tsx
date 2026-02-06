'use client';

import React, { useState } from 'react';
import {
    Users, Siren, AlertTriangle, Bell, Search, Filter,
    TrendingUp, TrendingDown, DollarSign, ShoppingBag,
    Percent, ClipboardCheck, AlertCircle, BarChart3,
    ChevronRight, ArrowUpRight, ArrowDownRight, X, Clock,
    FileText, Calendar, Activity, Info, Award
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { PosService } from '@/services/posService';
import { QscService } from '@/services/qscService';
import { AuthService } from '@/services/authService';
import { DashboardService } from '@/services/dashboardService';
import { useEffect } from 'react';

// --- MOCK DATA ---
const MOCK_KPI_DATA = {
    totalStores: 124,
    riskStores: 8,
    watchlistStores: 15,
    newEvents: 24,
};

const MOCK_RISK_DISTRIBUTION = [
    { name: '정상', count: 101, color: '#10b981' }, // Green
    { name: '관찰', count: 15, color: '#f59e0b' },  // Orange
    { name: '위험', count: 8, color: '#ef4444' },   // Red
];

const MOCK_TOP_RISK_STORES = [
    { id: 1, name: '강남역점', score: 92, status: 'RISK', reason: '위생 점검 2회 연속 불합격 및 매출 급감', trend: 'UP' },
    { id: 2, name: '홍대입구역점', score: 88, status: 'RISK', reason: '고객 클레임 급증 및 식자재 관리 부실', trend: 'UP' },
    { id: 3, name: '부산서면점', score: 85, status: 'RISK', reason: '인력 운영 공백 및 서비스 지표 하락', trend: 'STABLE' },
    { id: 4, name: '대구중앙로점', score: 82, status: 'RISK', reason: '매장 청결도 점수 하락 (D등급)', trend: 'DOWN' },
    { id: 5, name: '인천구월점', score: 79, status: 'WATCHLIST', reason: '전월 대비 원가율 15% 상승', trend: 'UP' },
];

const MOCK_POS_METRICS = [
    { label: '총 매출', value: '4.2억', change: '+12.5%', isPositive: true, icon: DollarSign },
    { label: '평균 마진율', value: '18.2%', change: '-1.4%', isPositive: false, icon: Percent },
    { label: '평균 객단가(AOV)', value: '14,200원', change: '+2.1%', isPositive: true, icon: ShoppingBag },
    { label: '총 주문 건수', value: '29,580건', change: '+8.4%', isPositive: true, icon: TrendingUp },
];

const MOCK_QSC_METRICS = [
    { label: '평균 QSC 점수', value: '88.4점', change: '+1.2점', isPositive: true },
    { label: '점검 완료율', value: '94.2%', change: '+0.5%', isPositive: true },
    { label: '불합격 점포 수(C/D)', value: '12개', change: '-2개', isPositive: true }, // Negative change in failed stores is positive
];

const MOCK_QSC_DISTRIBUTION = [
    { grade: 'S', count: 15 },
    { grade: 'A', count: 45 },
    { grade: 'B', count: 40 },
    { grade: 'C', count: 18 },
    { grade: 'D', count: 6 },
];

// --- COMPONENTS ---

const PosCard = ({ title, value, icon: Icon, trend, trendLabel, color }: any) => {
    const isPositive = trend >= 0;
    const colorStyle = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
    }[color as string] || 'text-gray-600 bg-gray-50 border-gray-100';

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-[180px] hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-tight">{title}</p>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {value.split('만원')[0]}
                        <span className="text-base font-bold text-gray-400 block mt-1">만원</span>
                    </h3>
                </div>
                <div className={`p-4 rounded-2xl border ${colorStyle} shadow-sm group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
                <div className={`flex items-center text-xs font-black ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {Math.abs(trend).toFixed(1)}%
                </div>
                <span className="text-[11px] text-gray-400 font-bold">{trendLabel}</span>
            </div>
        </div>
    );
};

const QscCard = ({ title, value, unit, icon: Icon, color, children }: any) => {
    const colorStyle = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        red: 'bg-red-50 text-red-600',
        gray: 'bg-gray-50 text-gray-500',
    }[color as string] || 'bg-gray-50 text-gray-500';

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-[150px]">
            <div className="flex items-center gap-3 mb-auto">
                <div className={`p-2 rounded-lg ${colorStyle}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-gray-500">{title}</h3>
            </div>
            {children ? (
                <div className="h-20 w-full mt-2">
                    {children}
                </div>
            ) : (
                <div className="flex items-baseline gap-1 mt-2">
                    <span className={`text-3xl font-black ${color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : 'text-gray-900'}`}>{value}</span>
                    <span className="text-gray-400 font-bold">{unit}</span>
                </div>
            )}
        </div>
    );
};

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        {children}
    </h2>
);

const TopRiskListDrawer = ({ isOpen, onClose, stores, onSelectStore }: any) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Siren className="w-5 h-5 text-red-500" />
                            위험 점포 TOP 5
                        </h2>
                        <p className="text-xs text-gray-400 font-bold mt-1 uppercase">REAL-TIME RISK MONITORING</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {stores.map((store: any, i: number) => (
                        <div
                            key={store.storeId || store.id}
                            onClick={() => onSelectStore(store)}
                            className="group p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all cursor-pointer flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-red-100 text-red-600' : 'bg-white text-gray-400 shadow-sm border border-gray-100'}`}>
                                    {i + 1}
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900 group-hover:text-red-700">{store.storeName || store.name}</p>
                                    <p className="text-xs text-gray-400 font-bold mt-0.5">Risk Score: <span className="text-red-500">{store.riskScore || store.currentStateScore || store.score}점</span></p>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-400" />
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-50 bg-gray-50/50">
                    <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                        * 해당 리스트는 실시간 AI 분석 결과에 따라 자동으로 업데이트됩니다. 점포를 클릭하여 상세 위험 분석 내용을 확인하세요.
                    </p>
                </div>
            </div>
        </div>
    );
};

const AdminDrawer = ({ isOpen, onClose, store, onBack }: any) => {
    if (!isOpen || !store) return null;

    const trendData = [
        { date: '01/30', score: store.score - 10 },
        { date: '02/01', score: store.score - 5 },
        { date: '02/03', score: store.score - 2 },
        { date: '02/05', score: store.score },
    ];

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                                <ArrowUpRight className="w-5 h-5 rotate-[225deg]" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${store.status === 'RISK' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {store.status === 'RISK' ? '위험' : '관찰'}
                                </span>
                                <span className="text-sm text-gray-500 font-medium">위험지수: {store.score}점</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* RISK REASON */}
                    <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
                        <h3 className="text-sm font-bold text-red-800 flex items-center gap-2 mb-3">
                            <AlertCircle className="w-4 h-4" />
                            핵심 위험 원인
                        </h3>
                        <p className="text-sm text-red-900 font-medium leading-relaxed">
                            {store.riskReason || store.reason || '종합적인 점검 결과 위험 징후가 감지되었습니다.'}
                        </p>
                    </div>

                    {/* RISK TREND */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-blue-600" />
                            위험 점수 추이
                        </h3>
                        <div className="h-48 w-full bg-gray-50 rounded-xl p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                    <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* RECENT EVENTS */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-orange-500" />
                                최근 감지 이벤트
                            </h3>
                            <button className="text-xs font-bold text-blue-600 hover:underline">전체보기</button>
                        </div>
                        <div className="space-y-3">
                            {[
                                { title: '위생 점검 결과 - D등급', time: '2시간 전', type: 'QSC' },
                                { title: '주문 취소율 15% 초과 발생', time: '5시간 전', type: 'POS' },
                                { title: '주요 식자재 품절 (원육)', time: '1일 전', type: 'STOCK' },
                            ].map((evt, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className={`mt-0.5 w-2 h-2 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-orange-500'}`} />
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">{evt.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-400">{evt.time}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded font-bold">{evt.type}</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100">
                    <button className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                        담당 SV에게 푸시 알림 보내기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdminDashboard({ user }: { user: any }) {
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isListDrawerOpen, setIsListDrawerOpen] = useState(false);

    // Backend States
    const [posSummary, setPosSummary] = useState<any>(null);
    const [posChartData, setPosChartData] = useState<any[]>([]);
    const [posRanking, setPosRanking] = useState<any[]>([]);
    const [qscStats, setQscStats] = useState<any>(null);
    const [qscGradeData, setQscGradeData] = useState<any[]>([]);

    const [adminSummary, setAdminSummary] = useState<any>(null);
    const [topRiskStores, setTopRiskStores] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Fetch All data in parallel
                const [posData, qscData, summaryData, riskStoresData] = await Promise.all([
                    PosService.getAdminDashboard('MONTH'),
                    QscService.getAdminDashboard({ limit: 0, offset: 0 }),
                    DashboardService.getAdminSummary(),
                    DashboardService.getSvRiskStores(5)
                ]);

                if (posData) {
                    setPosSummary(posData.summary);
                    setPosChartData(posData.chartData || []);
                    setPosRanking(posData.ranking || []);
                }

                if (qscData && qscData.summary) {
                    const s = qscData.summary;
                    setQscStats({
                        avgScore: Number((s.avgScore || 0).toFixed(1)),
                        completionRate: Math.round(s.completionRate || 0),
                        failedCount: s.failedStoreCount || 0
                    });

                    const distribution = s.gradeDistribution || {};
                    setQscGradeData([
                        { name: 'S', count: distribution.S || 0 },
                        { name: 'A', count: distribution.A || 0 },
                        { name: 'B', count: distribution.B || 0 },
                        { name: 'C', count: distribution.C || 0 },
                        { name: 'D', count: distribution.D || 0 },
                    ]);
                }

                if (summaryData) {
                    setAdminSummary(summaryData);
                    // Use riskTopStores from summary if dedicated fetch is empty or as additional source
                    if (!riskStoresData || riskStoresData.length === 0) {
                        setTopRiskStores(summaryData.riskTopStores || []);
                    } else {
                        setTopRiskStores(riskStoresData);
                    }
                } else if (riskStoresData) {
                    setTopRiskStores(riskStoresData);
                }

            } catch (e) {
                console.error("Dashboard and Backend integration error:", e);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const openStoreDetail = async (store: any) => {
        // Fetch real risk report if storeId exists
        if (store.storeId) {
            try {
                const report = await DashboardService.getRiskReport(store.storeId);
                setSelectedStore({
                    ...store,
                    name: store.storeName,
                    score: store.riskScore || store.currentStateScore,
                    status: store.state,
                    reason: report.reason,
                    riskReason: report.reason,
                    report
                });
            } catch (err) {
                console.error("Failed to fetch risk report:", err);
                setSelectedStore(store);
            }
        } else {
            setSelectedStore(store);
        }
        setIsDrawerOpen(true);
    };

    const handleOpenRiskList = () => {
        setIsListDrawerOpen(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const formatCurrency = (amount: number) => {
        return (amount / 10000).toLocaleString() + '만원';
    };

    // Card generic component for Risk KPIs (can't use KPICard anymore as it's removed)
    const RiskKPICard = ({ title, value, icon: Icon, colorClass, highlight, onClick }: any) => (
        <div
            onClick={onClick}
            className={`p-6 bg-white rounded-2xl border ${highlight ? 'border-red-200' : 'border-gray-100'} shadow-sm flex items-start justify-between transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:border-red-300' : ''}`}
        >
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className={`text-3xl font-bold ${colorClass || 'text-gray-900'}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${highlight ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );

    return (
        <div className="max-w-[1600px] mx-auto p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* 0. HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">본사관리자 대시보드</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        반갑습니다, <span className="text-[#1a73e8] font-bold">{user?.userName || '관리자'}</span>님. 브랜드 전체 운영 지표를 한눈에 확인하세요.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>2026년 2월 6일 (금)</span>
                    </div>
                </div>
            </div>

            {/* 1. TOP KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RiskKPICard title="전체 가맹점 수" value={`${adminSummary?.totalStoreCount || adminSummary?.totalStores || MOCK_KPI_DATA.totalStores}개`} icon={Users} />
                <RiskKPICard
                    title="위험(RISK) 점포"
                    value={`${adminSummary?.riskStoreCount || adminSummary?.riskStores || MOCK_KPI_DATA.riskStores}개`}
                    icon={Siren}
                    colorClass="text-red-600"
                    highlight
                    onClick={handleOpenRiskList}
                />
            </div>

            {/* 3. POS INDICATORS */}
            <section className="space-y-6">
                <SectionTitle>주문 지표(POS)</SectionTitle>

                {/* POS Analysis Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">매출 및 마진 추이 분석</h3>
                            <p className="text-sm text-gray-400 font-medium">최근 30일간의 브랜드 전체 매출과 평균 마진액 변화</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                <span className="text-xs font-bold text-gray-500">매출</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                                <span className="text-xs font-bold text-gray-500">마진액</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={posChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val: string) => val.slice(5)}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }}
                                />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    labelFormatter={(val: any) => val}
                                    formatter={(value: any, name: any) => [
                                        `${Math.floor(Number(value)).toLocaleString()}원`,
                                        name
                                    ]}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}
                                />
                                <Bar yAxisId="left" dataKey="revenue" name="매출" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line yAxisId="right" type="monotone" dataKey="margin" name="마진액" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>

            {/* 4. QSC INDICATORS */}
            <section>
                <SectionTitle>QSC 지표</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <QscCard title="평균 QSC 점수" value={qscStats?.avgScore || 0} unit="점" icon={Award} color="blue" />
                    <QscCard title="점검 완료율" value={qscStats?.completionRate || 0} unit="%" icon={ClipboardCheck} color="green" />
                    <QscCard title="불합격 점포" value={qscStats?.failedCount || 0} unit="개" icon={AlertCircle} color="red" />
                    <QscCard title="등급 분포" icon={BarChart3} color="gray">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={qscGradeData}>
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {qscGradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'S' || entry.name === 'A' ? '#10b981' :
                                                entry.name === 'B' ? '#f59e0b' : '#ef4444'
                                        } />
                                    ))}
                                </Bar>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </QscCard>
                </div>
            </section>

            {/* DRAWERS */}
            <TopRiskListDrawer
                isOpen={isListDrawerOpen}
                onClose={() => setIsListDrawerOpen(false)}
                stores={topRiskStores}
                onSelectStore={openStoreDetail}
            />
            <AdminDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                store={selectedStore}
                onBack={handleOpenRiskList}
            />
        </div>
    );
}
