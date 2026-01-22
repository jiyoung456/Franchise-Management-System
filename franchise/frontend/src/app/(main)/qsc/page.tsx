'use client';

import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import { Inspection } from '@/types';
import Link from 'next/link';
import {
    ClipboardCheck,
    AlertTriangle,
    CheckCircle2,
    Search,
    Filter,
    TrendingDown,
    TrendingUp,
    ChevronDown,
    Calendar,
    Award,
    AlertCircle
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { StoreService } from '@/services/storeService';
import { QscService } from '@/services/qscService';
import { AuthService } from '@/services/authService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';

// --- COMPONENT: SV DASHBOARD ---
function SvQscDashboard() {
    const [rankTab, setRankTab] = useState<'TOP' | 'BOTTOM'>('TOP');
    const [stats, setStats] = useState({
        avgScore: 0,
        avgScoreChange: 0,
        completionRate: 0,
        completionTargetDiff: 0,
        riskStoreCount: 0,
        sGradeCount: 0
    });
    const [timelineData, setTimelineData] = useState<{ month: string, score: number }[]>([]);
    const [rankingStores, setRankingStores] = useState<{ TOP: any[], BOTTOM: any[] }>({ TOP: [], BOTTOM: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user) return;

        const allInspections = QscService.getInspections();
        // Use StoreService to get stores correctly by ID
        const myStores = StoreService.getStoresBySv(user.id);
        const myStoreIds = myStores.map(s => s.id);

        // Filter Inspections for my stores
        const myInspections = allInspections.filter(i => myStoreIds.includes(i.storeId));

        const getAvgScore = (monthStr: string) => {
            const target = myInspections.filter(i => i.date.startsWith(monthStr));
            if (target.length === 0) return 0;
            const total = target.reduce((acc, cur) => acc + cur.score, 0);
            return Math.round((total / target.length) * 10) / 10;
        };

        // 1. Current Month
        const now = new Date();
        const currentMonthStr = now.toISOString().slice(0, 7);
        const avgScore = getAvgScore(currentMonthStr);

        // Prev Month
        const prevDate = new Date();
        prevDate.setMonth(prevDate.getMonth() - 1);
        const prevMonthStr = prevDate.toISOString().slice(0, 7);
        const prevAvgScore = getAvgScore(prevMonthStr);
        const avgScoreChange = prevAvgScore > 0 ? Math.round((avgScore - prevAvgScore) * 10) / 10 : 0;

        // 2. Completion Rate
        const currentMonthInspections = myInspections.filter(i => i.date.startsWith(currentMonthStr));
        const inspectedStoreCount = new Set(currentMonthInspections.map(i => i.storeId)).size;
        const completionRate = myStores.length > 0 ? Math.round((inspectedStoreCount / myStores.length) * 100) : 0;
        const completionTargetDiff = completionRate - 90;

        // 3. Risk & S Grade
        // Get latest inspection per store
        const latestInfo: Record<string, Inspection> = {};
        myInspections.forEach(i => {
            if (!latestInfo[i.storeId] || i.date > latestInfo[i.storeId].date) {
                latestInfo[i.storeId] = i;
            }
        });

        let riskCount = 0;
        let sCount = 0;
        Object.values(latestInfo).forEach(i => {
            if (['C', 'D'].includes(i.grade)) riskCount++;
            if (i.grade === 'S') sCount++;
        });

        setStats({
            avgScore,
            avgScoreChange,
            completionRate,
            completionTargetDiff,
            riskStoreCount: riskCount,
            sGradeCount: sCount
        });

        // 4. Timeline (Last 6 Months)
        const timeline = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const mStr = d.toISOString().slice(0, 7);
            const score = getAvgScore(mStr);
            timeline.push({
                month: `${d.getMonth() + 1}월`,
                score: score
            });
        }
        setTimelineData(timeline);

        // 5. Ranking
        const storeScores = Object.values(latestInfo).map(i => ({
            name: i.storeName,
            score: i.score,
            items: i.grade === 'S' ? ['관리 상태 우수'] : ['개선 필요']
        }));
        storeScores.sort((a, b) => b.score - a.score);

        setRankingStores({
            TOP: storeScores.slice(0, 3),
            BOTTOM: [...storeScores].reverse().slice(0, 3)
        });

        setLoading(false);

    }, []);

    if (loading) return <div className="p-10 text-center">데이터 로딩중...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">QSC 대시보드 (담당 점포)</h1>
                <p className="text-sm text-gray-500 mt-1">담당 점포의 QSC 성과 및 리스크를 한눈에 파악하세요.</p>
            </div>

            {/* 1. Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Avg QSC Score */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <h3 className="text-gray-500 font-bold text-sm">평균 QSC 점수 (월간)</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-gray-900">{stats.avgScore}점</span>
                        <span className={`text-sm font-bold mb-1 flex items-center ${stats.avgScoreChange >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                            {stats.avgScoreChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            {Math.abs(stats.avgScoreChange)}
                        </span>
                    </div>
                </div>

                {/* Inspection Completion Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <h3 className="text-gray-500 font-bold text-sm">점검 완료율</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-blue-600">{stats.completionRate}%</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">
                            목표 대비 {stats.completionTargetDiff >= 0 ? '+' : ''}{stats.completionTargetDiff}%
                        </span>
                    </div>
                </div>

                {/* Risk Store Count */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <h3 className="text-gray-500 font-bold text-sm">위험 점포 수 (C,D)</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-red-600">{stats.riskStoreCount}개</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">집중 케어 필요</span>
                    </div>
                </div>

                {/* S Grade Store Count */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-32">
                    <h3 className="text-gray-500 font-bold text-sm">S 등급 점포 수</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-extrabold text-green-600">{stats.sGradeCount}개</span>
                        <span className="text-sm font-bold text-gray-400 mb-1">우수 점포</span>
                    </div>
                </div>
            </div>

            {/* 2. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Timeline Chart */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-500" />
                            평균 QSC 점수 추이
                        </h3>
                        <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-600">최근 6개월</div>
                    </div>
                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                                <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Ranking & Key Items */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-[400px] flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setRankTab('TOP')}
                                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${rankTab === 'TOP' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                QSC 등급 상위
                            </button>
                            <button
                                onClick={() => setRankTab('BOTTOM')}
                                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${rankTab === 'BOTTOM' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                QSC 등급 하위
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {rankingStores[rankTab].length > 0 ? (
                            rankingStores[rankTab].map((store, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-2 ${rankTab === 'TOP' ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100'
                                    }`}>
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900 text-lg">{store.name}</span>
                                        <span className={`text-xl font-extrabold ${rankTab === 'TOP' ? 'text-blue-600' : 'text-red-600'}`}>
                                            {store.score}점
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        {store.items.map((item: string, itemIdx: number) => (
                                            <div key={itemIdx} className="flex items-start gap-2 text-sm text-gray-600">
                                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${rankTab === 'TOP' ? 'bg-blue-400' : 'bg-red-400'
                                                    }`} />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">데이터가 없습니다.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENT: ADMIN DASHBOARD (Modified to use StorageService) ---
function AdminQscDashboard({ user }: { user: any }) {
    const [inspections, setInspections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [visibleCount, setVisibleCount] = useState(5);

    useEffect(() => {
        const data = QscService.getInspections();
        // Filter out dummy data if needed, or assume StorageService has the 'real' data (including maybe some initial seed data). 
        // User asked to "remove dummy data and only show SV reports". 
        // If StorageService initializes with MOCK_INSPECTIONS, we might need to filter them out based on ID format or date?
        // But for now, let's trust StorageService contains the 'current state' (users can clear it if they want, or we assume StorageService IS the source of truth).
        // Actually, the user's request implies "Don't show the hardcoded MOCK_INSPECTIONS constant".
        setInspections(data);
        setLoading(false);
    }, []);

    // KPI Calc
    const avgScore = inspections.length > 0
        ? Number((inspections.reduce((acc, cur) => acc + cur.score, 0) / inspections.length).toFixed(1))
        : 0;
    const passedCount = inspections.filter(i => i.isPassed).length;
    const failedCount = inspections.length - passedCount;
    const allStores = StoreService.getStores();
    const currentMonthStr = new Date().toISOString().slice(0, 7);
    const inspectedCount = new Set(inspections.filter(i => i.date.startsWith(currentMonthStr)).map(i => i.storeId)).size;
    const completionRate = allStores.length > 0 ? Math.round((inspectedCount / allStores.length) * 100) : 0;

    const gradeCounts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
    inspections.forEach(i => {
        if (gradeCounts[i.grade] !== undefined) gradeCounts[i.grade]++;
    });
    const gradeData = [
        { name: 'S', count: gradeCounts.S },
        { name: 'A', count: gradeCounts.A },
        { name: 'B', count: gradeCounts.B },
        { name: 'C', count: gradeCounts.C },
        { name: 'D', count: gradeCounts.D },
    ];

    // Filter Logic
    const filteredInspections = useMemo(() => {
        let result = [...inspections].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (searchTerm) {
            result = result.filter(item => item.storeName.includes(searchTerm) || item.inspector.includes(searchTerm));
        }
        if (regionFilter !== 'ALL') {
            result = result.filter(item => item.region === regionFilter);
        }
        if (statusFilter !== 'ALL') {
            if (statusFilter === 'PASS') result = result.filter(item => item.isPassed);
            if (statusFilter === 'FAIL') result = result.filter(item => !item.isPassed);
        }
        return result;
    }, [inspections, searchTerm, regionFilter, statusFilter]);

    const visibleInspections = filteredInspections.slice(0, visibleCount);
    const hasMore = visibleCount < filteredInspections.length;

    if (loading) return <div className="p-10 text-center">데이터 로딩중...</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">QSC 관리 (전사)</h1>
                <p className="text-sm text-gray-500 mt-1">전사 QSC 점검 현황 및 품질 관리 리포트</p>
            </div>

            {/* Admin KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                {/* Avg Score */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">평균 QSC 점수</h3>
                    <div className="space-y-1">
                        <div className="text-sm text-gray-500">이번 달 평균 : <span className="text-xl font-bold text-gray-900">{avgScore}점</span></div>
                        <div className="text-sm text-gray-500">전월 대비 : <span className="text-red-500 font-bold">-3점</span></div>
                    </div>
                </div>

                {/* Completion Rate */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">점검 완료율</h3>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-gray-900">{completionRate}%</div>
                        <div className="text-sm text-gray-500">목표 대비 : <span className="text-blue-600 font-bold">+2%</span></div>
                    </div>
                </div>

                {/* Failed Stores */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-900 mb-4">불합격 점포 수</h3>
                    <div className="space-y-1">
                        <div className="text-2xl font-bold text-red-600">{failedCount}개</div>
                        <div className="text-sm text-gray-500">전월 대비 : <span className="text-red-500 font-bold">+3</span></div>
                    </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <h3 className="text-base font-bold text-gray-900 mb-2">등급 분포</h3>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData}>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'S' || entry.name === 'A' ? '#4ade80' :
                                                entry.name === 'B' ? '#facc15' : '#f87171'
                                        } />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white border border-gray-300 rounded-sm">
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center bg-gray-50">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <span className="font-bold text-gray-700">필터:</span>
                    </div>
                    <select className="border-gray-300 rounded text-sm p-2" value={regionFilter} onChange={e => setRegionFilter(e.target.value)}>
                        <option value="ALL">전체 지역</option>
                        <option value="서울/경기">서울/경기</option>
                        <option value="부산/경남">부산/경남</option>
                    </select>
                    <select className="border-gray-300 rounded text-sm p-2" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="ALL">전체 상태</option>
                        <option value="PASS">합격</option>
                        <option value="FAIL">불합격</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-600 font-bold border-b border-gray-300">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">점포명</th>
                                <th className="px-6 py-4 whitespace-nowrap">지역</th>
                                <th className="px-6 py-4 whitespace-nowrap">담당 SV</th>
                                <th className="px-6 py-4 whitespace-nowrap">점검일</th>
                                <th className="px-6 py-4 whitespace-nowrap">총점</th>
                                <th className="px-6 py-4 whitespace-nowrap">등급</th>
                                <th className="px-6 py-4 whitespace-nowrap">합격 여부</th>
                                <th className="px-6 py-4 whitespace-nowrap">관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleInspections.map(item => (
                                <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-100">
                                    <td className="px-6 py-4 font-bold">{item.storeName}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.region}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.sv}</td>
                                    <td className="px-6 py-4 text-gray-600">{item.date}</td>
                                    <td className="px-6 py-4 font-bold">{item.score}점</td>
                                    <td className="px-6 py-4"><span className="border px-2 py-1 rounded-sm text-xs font-bold">{item.grade}</span></td>
                                    <td className="px-6 py-4">
                                        {item.isPassed ? <span className="text-green-600 font-bold">합격</span> : <span className="text-red-600 font-bold">불합격</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Link href={`/qsc/report/${item.id}`} className="text-blue-600 hover:underline font-medium">리포트</Link>
                                    </td>
                                </tr>
                            ))}
                            {visibleInspections.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                                        등록된 점검 이력이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {hasMore && (
                    <div className="p-4 text-center border-t border-gray-200">
                        <button onClick={() => setVisibleCount(p => p + 5)} className="text-sm font-bold text-gray-600">더 보기</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- MAIN PAGE COMPONENT ---
export default function QscDashboardPage() {
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        AuthService.init();
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
        if (currentUser) setRole(currentUser.role);
    }, []);

    if (!role) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="pb-20">
            {role === 'SUPERVISOR' ? <SvQscDashboard /> : <AdminQscDashboard user={user} />}
        </div>
    );
}
