'use client';

import Link from 'next/link';
import { StorageService } from '@/lib/storage';
import { MOCK_BRIEFING } from '@/lib/mock/mockBriefingData';
import BriefingWidget from '@/components/dashboard/BriefingWidget';
import {
    AlertTriangle, TrendingUp, Users, Store as StoreIcon,
    ClipboardList, Siren, Bell, ArrowRight, Activity, Calendar, CheckSquare, MapPin,
    ClipboardCheck, AlertCircle, TrendingDown, CheckCircle2, BarChart3
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_EVENTS } from '@/lib/mock/mockEventData';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { ActionService } from '@/services/actionService';
import { DashboardService } from '@/services/dashboardService';
import { ManagerDashboardSummary, SupervisorDashboardSummary, AdminDashboardSummary } from '@/types';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';
import { StoreService } from '@/services/storeService';
import { User, Store } from '@/types';
import { ManagerDashboard } from '@/components/dashboard/manager/ManagerDashboard';

// --- MOCK DATA FOR SV DASHBOARD ---
const MOCK_VISIT_STATUS = {
    visited: 12,
    total: 20
};

const MOCK_RECENT_VISITS = [
    { id: 1, storeName: '강남점', date: '2026-01-14', score: 92, type: '정기점검' },
    { id: 2, storeName: '서초점', date: '2026-01-12', score: 88, type: '정기점검' },
    { id: 3, storeName: '반포점', date: '2026-01-10', score: 95, type: '기획점검' },
];

const GRADE_DISTRIBUTION_DATA = [
    { name: 'S등급', value: 4, color: '#10b981' },
    { name: 'A등급', value: 8, color: '#3b82f6' },
    { name: 'B등급', value: 5, color: '#f59e0b' },
    { name: 'C등급', value: 3, color: '#ef4444' },
];

// --- ADMIN DASHBOARD ---
function AdminDashboard() {
    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await DashboardService.getAdminSummary();
                setSummary(data);
            } catch (error) {
                console.error("Failed to load admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    // Use backend data or defaults
    const totalStores = summary?.totalStoreCount ?? 0;
    const riskStores = summary?.riskStoreCount ?? 0;
    // Calculate percent manually
    const riskPercent = totalStores > 0 ? ((riskStores / totalStores) * 100).toFixed(1) : 0;
    const newEvents = summary?.newEventCount ?? 0;
    const unresolvedActions = summary?.pendingActionCount ?? 0;
    const topRiskStores = summary?.riskTopStores ?? [];

    // Map backend trend data to chart format
    const formatMonth = (m: string) => {
        if (!m || !m.includes('-')) return m;
        return `${parseInt(m.split('-')[1])}월`;
    };

    const qscTrendData = summary?.avgQscTrend?.map((p: any) => ({
        month: formatMonth(p.month),
        score: p.avgScore
    })) ?? [];

    const salesTrendData = summary?.salesChangeTrend?.map((p: any) => ({
        month: formatMonth(p.month),
        sales: p.changeRate || 0
    })) ?? [];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">운영 대시보드</h1>
                <p className="text-sm text-gray-500 mt-1">전체 가맹점의 운영 현황과 주요 위험 요소를 실시간으로 모니터링합니다.</p>
            </div>

            {/* Top Metric Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">전체 가맹점 수</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalStores}개</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-red-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">위험(Risk) 점포</p>
                        <h3 className="text-2xl font-bold text-red-600 mt-1">{riskStores}개</h3>

                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <Siren className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">신규 이벤트 (48h)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{newEvents}건</h3>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600"><Bell className="w-5 h-5" /></div>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">조치 미이행/지연</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{unresolvedActions}건</h3>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600"><ClipboardList className="w-5 h-5" /></div>
                </div>
            </div>

            {/* Admin Charts Area */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4"><Activity className="w-4 h-4 mr-2 text-blue-500" />평균 QSC 점수 추이</h3>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={qscTrendData} margin={{ left: 10, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Sales Trend */}
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 flex items-center mb-4"><TrendingUp className="w-4 h-4 mr-2 text-green-500" />전체 매출 변화율</h3>
                            <div className="h-[200px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={salesTrendData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} /></BarChart></ResponsiveContainer></div>
                        </div>
                    </div>

                </div>
                {/* Risk Stores List */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
                    <h3 className="font-bold text-gray-900 flex items-center mb-4"><AlertTriangle className="w-4 h-4 mr-2 text-red-500" />위험 점포 TOP 5</h3>
                    <div className="space-y-4">
                        {topRiskStores.length > 0 ? (topRiskStores as any[]).map((store: any, i: number) => (
                            <div key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded transition-colors group">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-red-700 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                                    {i + 1}. {store.storeName}
                                </span>
                                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded min-w-[50px] text-center">{store.riskScore}점</span>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-400 text-sm">위험 점포가 없습니다.</div>
                        )}
                        <div className="pt-2 text-xs text-center text-gray-400">
                            * 최근 30일 내 리스크 스코어 기준
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



// --- SV DASHBOARD (Original) ---
function SvDashboard({ user }: { user: User }) {
    const [dashboardData, setDashboardData] = useState<SupervisorDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // Call getSvDashboard
                const data = await DashboardService.getSvDashboard(user.loginId);
                setDashboardData(data);

                // Fetch Stores for list compatibility if needed, or remove if not used here
                // Originally myStores was used for calculating locally. Now mostly replaced.
                // But if there are other usages of myStores in SvDashboard (none seen), we can optimize.
                // For safety, let's just use the dashboardData.

            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        init();
    }, [user]);

    // Map backend response to UI structure
    // If data is not yet loaded, use safe defaults
    const topCardData = {
        assigned: dashboardData?.assignedStoreCount ?? 0,
        risk: dashboardData?.riskStoreCount ?? 0,
        recentEvents: dashboardData?.recentEventCount ?? 0,
        pendingActions: dashboardData?.pendingActionCount ?? 0
    };

    const riskTrendData = dashboardData?.weeklyAvgRiskScoreTrend.map(t => ({ label: t.label, score: t.value })) ?? [];
    const revenueTrendData = dashboardData?.monthlyAvgSalesChangeRateTrend.map(t => ({ label: t.label, val: t.value })) ?? [];

    const gradeCounts = {
        NORMAL: dashboardData?.stateDistribution.normalCount ?? 0,
        WATCHLIST: dashboardData?.stateDistribution.watchCount ?? 0,
        RISK: dashboardData?.stateDistribution.riskCount ?? 0,
    };

    const visitStatus = dashboardData?.visitStatus ?? { completedCount: 0, totalCount: 0, completionRatePct: 0 };
    const visitRate = visitStatus.completionRatePct;
    const visitedThisMonth = visitStatus.completedCount;

    const recentVisits = dashboardData?.recentVisitedStores.map(s => ({
        id: s.storeId,
        name: s.storeName,
        lastInspectionDate: s.visitedAt
    })) ?? [];

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">운영 대시보드</h1>
                <p className="text-sm text-gray-500 mt-1">담당 가맹점의 현황을 한눈에 파악하세요.</p>
            </div>

            {/* Top Cards (4 Grid) */}
            <div className="grid gap-4 theme-grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <p className="text-gray-500 font-medium">담당 점포 수</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-900">{topCardData.assigned}개</h3>
                        <StoreIcon className="w-8 h-8 text-blue-100 text-blue-500" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <p className="text-gray-500 font-medium">위험 점포 수</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-red-600">{topCardData.risk}개</h3>
                        <AlertTriangle className="w-8 h-8 text-red-100 text-red-500" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <p className="text-gray-500 font-medium">최근 이벤트 (24~48h)</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-900">{topCardData.recentEvents}건</h3>
                        <Bell className="w-8 h-8 text-yellow-100 text-yellow-500" strokeWidth={1.5} />
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <p className="text-gray-500 font-medium">미이행 조치</p>
                    <div className="flex justify-between items-end">
                        <h3 className="text-3xl font-bold text-gray-900">{topCardData.pendingActions}건</h3>
                        <CheckSquare className="w-8 h-8 text-orange-100 text-orange-500" strokeWidth={1.5} />
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">평균 위험 점수 추이</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={riskTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">평균 매출 변화율 추이</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueTrendData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Widgets (New) */}
            <div className="grid gap-6 md:grid-cols-3">

                {/* Widget 1: Grade Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-gray-500" />
                        등급별 분포 현황
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                            <span className="font-medium text-green-700">정상 (Normal)</span>
                            <span className="font-bold text-green-700 text-lg">{gradeCounts.NORMAL}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                            <span className="font-medium text-orange-700">관찰 필요 (Watch)</span>
                            <span className="font-bold text-orange-700 text-lg">{gradeCounts.WATCHLIST}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <span className="font-medium text-red-700">위험 (Risk)</span>
                            <span className="font-bold text-red-700 text-lg">{gradeCounts.RISK}</span>
                        </div>
                    </div>
                </div>

                {/* Widget 2: Visit Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                        방문 현황 (이번 달)
                    </h3>
                    <div className="flex flex-col items-center justify-center flex-1 space-y-4 py-4">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <svg className="transform -rotate-90 w-full h-full">
                                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                                <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="#3b82f6"
                                    strokeWidth="12"
                                    fill="transparent"
                                    strokeDasharray={351.86}
                                    strokeDashoffset={351.86 - (351.86 * visitRate) / 100}
                                    className="transition-all duration-1000 ease-out"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-3xl font-bold text-gray-900">{visitRate}%</span>
                                <span className="text-xs text-gray-500">완료율</span>
                            </div>
                        </div>
                        <div className="text-center text-sm text-gray-600">
                            <span className="font-semibold text-blue-600">{visitedThisMonth}</span> / {topCardData.assigned} 점포 방문 완료
                        </div>
                    </div>
                </div>

                {/* Widget 3: Recent Visits */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                        최근 방문 점포
                    </h3>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[220px]">
                        {recentVisits.length > 0 ? (
                            recentVisits.map((store) => (
                                <div key={store.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">{store.name}</p>
                                        <p className="text-xs text-gray-500">{store.lastInspectionDate ? store.lastInspectionDate.split('T')[0] : '-'}</p>
                                    </div>
                                    <Link href={`/stores/${store.id}`} className="p-1.5 bg-gray-100 rounded text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                방문 기록이 없습니다.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}




export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            // Small delay to ensure auth check isn't too fast for state updates if needed
            // But standard way:
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                router.replace('/login');
                return;
            }
            setUser(currentUser);
            setIsLoading(false);
        };
        checkUser();
    }, []);

    if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>;

    const isTeamLeader = user.role === 'SUPERVISOR' || user.role === 'ADMIN' || user.role === 'MANAGER';

    return (
        <>
            {user.role === 'ADMIN' ? (
                <AdminDashboard />
            ) : user.role === 'MANAGER' ? (
                <ManagerDashboard user={user} />
            ) : (
                <SvDashboard user={user} />
            )}
        </>
    );
}
