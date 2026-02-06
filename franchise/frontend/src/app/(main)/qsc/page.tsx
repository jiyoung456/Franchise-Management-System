'use client';

import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import { Inspection, Store } from '@/types';
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
import { StoreService, getBackendRegionCode, getRegionName } from '@/services/storeService';
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
        const fetchStats = async () => {
            const user = await AuthService.getCurrentUser();
            if (!user) return;

            const now = new Date();
            const currentMonthStr = now.toISOString().slice(0, 7); // yyyy-MM

            // Parallel Fetch
            const [summary, trend, topRank, bottomRank] = await Promise.all([
                QscService.getDashboardSummary(currentMonthStr),
                QscService.getDashboardTrend(currentMonthStr, 6),
                QscService.getDashboardRanking(currentMonthStr, 'top', 3),
                QscService.getDashboardRanking(currentMonthStr, 'bottom', 3)
            ]);

            // 1. Stats
            if (summary) {
                // Determine Score Change from Trend if available
                let scoreChange = 0;
                if (trend && trend.rows && trend.rows.length >= 2) {
                    const rows = trend.rows;
                    // Sort just in case backend doesn't
                    rows.sort((a: any, b: any) => a.month.localeCompare(b.month));
                    const current = rows[rows.length - 1]; // This month (or latest available)
                    const prev = rows[rows.length - 2];

                    // If current month matches requested month and we have prev
                    if (current && prev && current.avgScore != null && prev.avgScore != null) {
                        scoreChange = Number((current.avgScore - prev.avgScore).toFixed(1));
                    }
                }

                setStats({
                    avgScore: Number((summary.avgScore || 0).toFixed(2)),
                    avgScoreChange: scoreChange,
                    completionRate: Math.round((summary.completionRate || 0) * 100),
                    completionTargetDiff: Math.round((summary.completionDelta || 0) * 100),
                    riskStoreCount: summary.riskStoreCount || 0,
                    sGradeCount: summary.sStoreCount || 0
                });
            }

            // 2. Timeline
            if (trend && trend.rows) {
                const chartData = trend.rows.map((row: any) => ({
                    month: row.month.substring(5) + '월', // 2026-01 -> 01월
                    score: row.avgScore || 0
                }));
                setTimelineData(chartData);
            }

            // 3. Ranking
            setRankingStores({
                TOP: topRank?.items?.map((item: any) => ({
                    name: item.storeName,
                    score: item.score,
                    items: item.grade === 'S' ? ['관리 상태 우수'] : ['양호']
                })) || [],
                BOTTOM: bottomRank?.items?.map((item: any) => ({
                    name: item.storeName,
                    score: item.score,
                    items: item.summaryComment ? [item.summaryComment] : ['개선 필요']
                })) || []
            });

            setLoading(false);
        };

        fetchStats();
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

// --- CUSTOM DROPDOWN COMPONENT ---
function FilterDropdown({
    label,
    value,
    options,
    onChange
}: {
    label?: string,
    value: string,
    options: { label: string, value: string }[],
    onChange: (val: string) => void
}) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="relative inline-block text-left min-w-[140px]">
            <div className="flex items-center gap-2">
                {label && <span className="text-sm font-bold text-gray-700 whitespace-nowrap">{label}</span>}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    {selectedOption.label}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
                        <div className="py-1">
                            {options.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`${opt.value === value
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        } block w-full text-left px-4 py-2 text-sm transition-colors`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// --- COMPONENT: ADMIN DASHBOARD ---
function AdminQscDashboard({ user }: { user: any }) {
    const [inspections, setInspections] = useState<any[]>([]);
    const [stats, setStats] = useState({
        avgScore: 0,
        completionRate: 0,
        failedCount: 0
    });
    const [gradeData, setGradeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [visibleCount, setVisibleCount] = useState(10);

    const statusOptions = [
        { label: '전체 상태', value: 'ALL' },
        { label: '합격', value: 'PASS' },
        { label: '불합격', value: 'FAIL' },
    ];

    useEffect(() => {
        const fetchAdminData = async () => {
            setLoading(true);
            try {
                const filters: any = {
                    limit: 100,
                    offset: 0
                };

                // 상태 필터: 결과(합격/불합격)에 대한 다양한 파라미터 명칭 대응
                if (statusFilter === 'PASS') {
                    filters.isPassed = true;
                    filters.passFilter = 'PASS';
                    filters.passed = true;
                } else if (statusFilter === 'FAIL') {
                    filters.isPassed = false;
                    filters.passFilter = 'FAIL';
                    filters.passed = false;
                }

                const res = await QscService.getAdminDashboard(filters);

                if (res) {
                    // 백엔드가 배열을 반환하거나 { summary, list: { rows: [] } } 형태를 반환하는 경우 모두 대응
                    let dataArray = [];
                    let summaryData = null;

                    if (Array.isArray(res)) {
                        dataArray = res;
                    } else if (res.list && Array.isArray(res.list.rows)) {
                        dataArray = res.list.rows;
                        summaryData = res.summary;
                    } else if (res.list && Array.isArray(res.list)) {
                        dataArray = res.list;
                        summaryData = res.summary;
                    }

                    // 점검 목록 매핑 (백엔드 필드명 정합: inspectorName, isPassed 사용)
                    const mappedInspections = dataArray.map((row: any) => ({
                        id: row.inspectionId ? row.inspectionId.toString() : (row.storeId ? row.storeId.toString() : Math.random().toString()),
                        storeId: row.storeId ? row.storeId.toString() : '',
                        storeName: row.storeName || '-',
                        region: getRegionName(row.regionCode),
                        sv: row.inspectorName || row.supervisorName || '-',
                        date: row.inspectedAt ? row.inspectedAt.split('T')[0] : '-',
                        score: row.totalScore || 0,
                        grade: row.grade || '-',
                        isPassed: row.isPassed !== undefined ? row.isPassed : row.passed
                    }));
                    setInspections(mappedInspections);

                    // 통계 데이터 업데이트
                    if (summaryData) {
                        setStats({
                            avgScore: Number((summaryData.avgScore || 0).toFixed(2)),
                            completionRate: Math.round(summaryData.completionRate || 0),
                            failedCount: summaryData.failedStoreCount || 0
                        });

                        const gradeCounts = summaryData.gradeDistribution || {};
                        const gData = [
                            { name: 'S', count: gradeCounts.S || 0 },
                            { name: 'A', count: gradeCounts.A || 0 },
                            { name: 'B', count: gradeCounts.B || 0 },
                            { name: 'C', count: gradeCounts.C || 0 },
                            { name: 'D', count: gradeCounts.D || 0 },
                        ];
                        setGradeData(gData);
                    } else if (dataArray.length > 0) {
                        // 요약 데이터가 없을 경우 리스트에서 직접 계산
                        const totalScore = dataArray.reduce((acc: number, curr: any) => acc + (curr.totalScore || 0), 0);
                        const avgScore = totalScore / dataArray.length;
                        const failedCount = dataArray.filter((item: any) => item.isPassed === false || item.passed === false).length;

                        setStats(prev => ({
                            ...prev,
                            avgScore: Number(avgScore.toFixed(2)),
                            failedCount: failedCount
                        }));

                        const distribution = dataArray.reduce((acc: any, curr: any) => {
                            if (curr.grade) acc[curr.grade] = (acc[curr.grade] || 0) + 1;
                            return acc;
                        }, {});

                        const gData = ['S', 'A', 'B', 'C', 'D'].map(g => ({
                            name: g,
                            count: distribution[g] || 0
                        }));
                        setGradeData(gData);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch admin dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, [statusFilter]);

    const filteredInspections = useMemo(() => {
        let result = [...inspections];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(item =>
                item.storeName.toLowerCase().includes(lowerSearch) ||
                (item.sv && item.sv.toLowerCase().includes(lowerSearch))
            );
        }
        return result;
    }, [inspections, searchTerm]);

    const visibleInspections = filteredInspections.slice(0, visibleCount);
    const hasMore = visibleCount < filteredInspections.length;

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">QSC 품질 관리</h1>
                <p className="text-md text-gray-500 mt-2">전체 가맹점의 QSC 점검 현황 및 등급별 분포를 모니터링합니다.</p>
            </div>

            {/* Admin KPI Cards */}
            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500">평균 QSC 점수</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-gray-900">{stats.avgScore}</span>
                        <span className="text-gray-400 font-bold">점</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <ClipboardCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500">점검 완료율</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-green-600">{stats.completionRate}</span>
                        <span className="text-gray-400 font-bold">%</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-500">불합격 점포</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-red-600">{stats.failedCount}</span>
                        <span className="text-gray-400 font-bold">개</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-sm font-bold text-gray-500 mb-4">등급 분포</h3>
                    <div className="h-20 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={gradeData}>
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'S' || entry.name === 'A' ? '#10b981' :
                                                entry.name === 'B' ? '#f59e0b' : '#ef4444'
                                        } />
                                    ))}
                                </Bar>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* List Table Section */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-white space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-gray-400" />
                                <span className="font-bold text-gray-700">필터:</span>
                            </div>
                            <FilterDropdown
                                value={statusFilter}
                                options={statusOptions}
                                onChange={setStatusFilter}
                            />
                        </div>
                        <div className="relative group w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="점포명 또는 담당 SV 검색..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">점포명</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">지역</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">담당 SV</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">점검일</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">총점</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">등급</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">결과</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleInspections.map(item => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{item.storeName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-600">{item.region}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                                                {item.sv?.substring(0, 1)}
                                            </div>
                                            <span className="text-gray-600 font-medium">{item.sv || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{item.date}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-extrabold text-blue-600">{item.score}</span>
                                        <span className="text-[10px] text-gray-400 font-bold ml-0.5">점</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm border ${item.grade === 'S' || item.grade === 'A' ? 'bg-green-50 border-green-200 text-green-700' :
                                            item.grade === 'B' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                'bg-red-50 border-red-200 text-red-700'
                                            }`}>
                                            {item.grade}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {item.isPassed ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                                <CheckCircle2 className="w-3 h-3" />
                                                합격
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                                                <AlertTriangle className="w-3 h-3" />
                                                불합격
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/qsc/report/${item.id}?storeId=${item.storeId}`}
                                            className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            상세 보기
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {visibleInspections.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Search className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="text-gray-500 font-medium">검색 결과가 없습니다.</p>
                                            <button
                                                onClick={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
                                                className="text-blue-600 text-sm font-bold hover:underline mt-2"
                                            >
                                                필터 초기화
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {hasMore && (
                    <div className="p-6 text-center border-t border-gray-100 bg-gray-50/30">
                        <button
                            onClick={() => setVisibleCount(p => p + 10)}
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
                        >
                            더 많은 점검 결과 보기
                            <ChevronDown className="w-4 h-4" />
                        </button>
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
        const initUser = async () => {
            await AuthService.init();
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
            if (currentUser) setRole(currentUser.role);
        };
        initUser();
    }, []);

    if (!role) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    return (
        <div className="pb-20">
            {role === 'SUPERVISOR' ? <SvQscDashboard /> : <AdminQscDashboard user={user} />}
        </div>
    );
}
