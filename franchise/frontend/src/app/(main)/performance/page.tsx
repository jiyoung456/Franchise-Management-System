'use client';

import { useState, useMemo, useEffect } from 'react';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_POS_DATA } from '@/lib/mock/mockPosData';
import { MOCK_PERFORMANCE } from '@/lib/mock/mockSalesData';
import { StorageService } from '@/lib/storage';
import { StoreService } from '@/services/storeService';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Percent, Filter, ChevronDown, ChevronUp, Search, Minus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PosService } from '@/services/posService';

export default function PerformanceDashboardPage() {
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);

    useEffect(() => {
        StorageService.init();
        const user = StorageService.getCurrentUser();
        if (user) {
            setRole(user.role);
        } else {
            // Default fallback for dev/demo if no user in storage
            setRole('ADMIN');
        }
    }, []);

    if (!role) return <div className="p-8">Loading...</div>;

    return <AdminPerformanceDashboard isSv={role === 'SUPERVISOR'} />;
}

// --- SV VIEW ---
function SvPerformanceView() {
    const router = useRouter();
    const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('MONTH');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [rankSort, setRankSort] = useState<'top' | 'bottom'>('top');
    const [isListExpanded, setIsListExpanded] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            try {
                // 1. Fetch Performance Data (may have empty list if no sales)
                const posData = await PosService.getSupervisorDashboard(period, undefined);

                // 2. Fetch Assigned Stores (Master List)
                const myStores = await StoreService.getStoresBySv();

                if (posData) {
                    // Merge: If posData.storeList is empty, use myStores to populate it with 0 values
                    if (posData.storeList.length === 0 && myStores.length > 0) {
                        posData.storeList = myStores.map((store: any) => ({
                            storeId: Number(store.id),
                            storeName: store.name,
                            region: store.region,
                            revenue: 0,
                            margin: 0,
                            marginRate: 0,
                            growth: 0
                        }));
                    }
                    setData(posData);
                } else {
                    setData(null);
                }
            } catch (e) {
                console.error("Failed to load SV dashboard", e);
                setData(null);
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, [period]);

    if (loading) return <div className="p-12 text-center">Loading...</div>;
    if (!data) return <div className="p-12 text-center">데이터를 불러올 수 없습니다.</div>;

    const { summary, chartData, ranking, storeList } = data;

    // Helper for currency
    const formatCurrency = (amount: number) => {
        return (amount / 10000).toLocaleString() + '만원';
    };

    // Sorting ranking
    const sortedRanking = [...ranking].sort((a: any, b: any) => b.revenue - a.revenue);
    const displayRanking = rankSort === 'top' ? sortedRanking.slice(0, 5) : [...sortedRanking].reverse().slice(0, 5);

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        성과 분석 대시보드
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        점포 매출, 마진율, 객단가 등 핵심 성과 지표(KPI)를 분석합니다.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <div className="flex bg-gray-100 rounded p-1">
                        <button
                            onClick={() => setPeriod('WEEK')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${period === 'WEEK' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            1주일
                        </button>
                        <button
                            onClick={() => setPeriod('MONTH')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${period === 'MONTH' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            1개월
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="총 매출"
                    value={formatCurrency(summary.totalSales * 10000)} // The helper expects raw number but adds '만원', quick fix to reuse
                    icon={DollarSign}
                    trend={summary.totalSalesRate}
                    trendLabel="2주 전 대비"
                    color="blue"
                />
                <KPICard
                    title="평균 마진율"
                    value={`${summary.marginRate.toFixed(1)}%`}
                    icon={Percent}
                    trend={summary.marginRateDiff}
                    trendLabel=""
                    color="indigo"
                />
                <KPICard
                    title="평균 객단가 (AOV)"
                    value={`${summary.aov.toLocaleString()}원`}
                    icon={ShoppingBag}
                    trend={summary.aovRate}
                    trendLabel="2주 전 대비"
                    color="purple"
                />
                <KPICard
                    title="총 주문 건수"
                    value={`${summary.totalOrders.toLocaleString()}건`}
                    icon={Users}
                    trend={summary.totalOrdersRate}
                    trendLabel="2주 전 대비"
                    color="orange"
                />
            </div>

            {/* Combined Analysis Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">매출 및 마진 추이 분석</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> 매출
                                <span className="w-6 h-0.5 bg-purple-500 mx-2"></span> 마진
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val: string) => val.slice(5)}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    labelFormatter={(val: any) => val}
                                    formatter={(value: any, name: any) => [
                                        `${Number(value).toLocaleString()}원`,
                                        name === 'revenue' ? '매출' : '마진'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top/Bottom 5 Widget */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">점포 랭킹</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setRankSort('top')}
                                className={`px-2 py-1 text-xs font-bold rounded ${rankSort === 'top' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                Top 5
                            </button>
                            <button
                                onClick={() => setRankSort('bottom')}
                                className={`px-2 py-1 text-xs font-bold rounded ${rankSort === 'bottom' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Low 5
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {displayRanking.map((store: any, idx: number) => (
                                <div key={store.storeId} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rankSort === 'top' ? (idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500') : 'bg-red-50 text-red-600'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors">
                                                <Link href={`/performance/${store.storeId}`}>{store.storeName}</Link>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{store.region}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{(store.revenue / 10000).toLocaleString()}만</p>
                                        <p className={`text-xs font-medium ${store.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {store.growth > 0 ? '+' : ''}{store.growth}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Store List Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                    className="p-6 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsListExpanded(!isListExpanded)}
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        성과 리스트 (상세)
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Total {storeList.length}
                        </span>
                    </h3>
                    {isListExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {isListExpanded && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 cursor-pointer hover:text-gray-700">점포명</th>
                                    <th className="px-6 py-3">지역</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">매출</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">마진 (마진율)</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">성장률</th>
                                    <th className="px-6 py-3 text-center">상세</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {storeList.map((store: any) => (
                                    <tr key={store.storeId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {store.storeName}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{store.region}</td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {(store.revenue).toLocaleString()}원
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(store.margin).toLocaleString()}원
                                            <span className="text-xs text-gray-400 ml-1">({store.marginRate.toFixed(1)}%)</span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${store.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {store.growth > 0 ? '+' : ''}{store.growth}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/performance/${store.storeId}`}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                            >
                                                상세
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- ADMIN VIEW (Existing Dashboard) ---
function AdminPerformanceDashboard({ isSv = false }: { isSv?: boolean }) {
    // --- Filters State ---
    const [period, setPeriod] = useState<'week' | 'month'>('month');
    const [selectedRegion, setSelectedRegion] = useState<string>('all');
    const [rankSort, setRankSort] = useState<'top' | 'bottom'>('top');
    const [isListExpanded, setIsListExpanded] = useState(false);

    // --- Data Aggregation Logic ---
    // 1. Filter Stores
    const filteredStores = useMemo(() => {
        if (selectedRegion === 'all') return MOCK_STORES;
        return MOCK_STORES.filter(s => s.region === selectedRegion);
    }, [selectedRegion]);

    // 2. Aggregate Data
    const daysToLookBack = period === 'month' ? 30 : 7;

    const aggregatedData = useMemo(() => {
        let totalRev = 0;
        let totalCost = 0;
        let totalOrders = 0;
        let prevTotalRev = 0;

        const chartMap = new Map<string, { date: string, revenue: number, margin: number, orders: number }>();

        filteredStores.forEach(store => {
            const storeIdStr = store.id.toString();
            // Fallback to '1' if mock data missing for specific store
            const posData = MOCK_POS_DATA[storeIdStr] || MOCK_POS_DATA['1'];
            const history = posData.dailySales;

            const targetData = history.slice(-daysToLookBack);
            const prevData = history.slice(-daysToLookBack * 2, -daysToLookBack);

            targetData.forEach(d => {
                totalRev += d.revenue;
                totalCost += d.cost;
                totalOrders += d.orderCount;

                const existing = chartMap.get(d.date) || { date: d.date, revenue: 0, margin: 0, orders: 0 };
                existing.revenue += d.revenue;
                existing.margin += d.margin;
                existing.orders += d.orderCount;
                chartMap.set(d.date, existing);
            });

            prevData.forEach(d => {
                prevTotalRev += d.revenue;
            });
        });

        const chartData = Array.from(chartMap.values()).sort((a, b) => a.date.localeCompare(b.date));

        const totalMargin = totalRev - totalCost;
        const marginRate = totalRev > 0 ? (totalMargin / totalRev) * 100 : 0;
        const aov = totalOrders > 0 ? totalRev / totalOrders : 0;
        const growth = prevTotalRev > 0 ? ((totalRev - prevTotalRev) / prevTotalRev) * 100 : 0;

        return {
            totalRev,
            marginRate,
            aov,
            growth,
            totalOrders,
            chartData
        };
    }, [filteredStores, daysToLookBack]);

    // 3. Store Ranking Logic
    const storeMetrics = useMemo(() => {
        return filteredStores.map(store => {
            const storeIdStr = store.id.toString();
            const posData = MOCK_POS_DATA[storeIdStr] || MOCK_POS_DATA['1'];
            const history = posData.dailySales.slice(-daysToLookBack);

            const revenue = history.reduce((sum, d) => sum + d.revenue, 0);
            const cost = history.reduce((sum, d) => sum + d.cost, 0);
            const margin = revenue - cost;
            const marginRate = revenue > 0 ? (margin / revenue) * 100 : 0;
            // Mock growth random per store for demo
            const growth = parseFloat((Math.random() * 20 - 5).toFixed(1));

            return {
                id: store.id,
                name: store.name,
                region: store.region,
                revenue,
                margin,
                marginRate,
                growth
            };
        });
    }, [filteredStores, daysToLookBack]);

    const sortedStores = useMemo(() => {
        const sorted = [...storeMetrics].sort((a, b) => b.revenue - a.revenue);
        return rankSort === 'top' ? sorted : sorted.reverse();
    }, [storeMetrics, rankSort]);

    return (
        <div className="space-y-6 pb-20">
            {/* Header & Filter */}
            {/* DEBUG INFO - TO BE REMOVED */}
            {/* <div className="bg-red-100 p-2 text-xs text-red-600 mb-2">DEBUG: Role={isSv ? 'SV (isSv=true)' : 'ADMIN (isSv=false)'}</div> */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                        성과 분석 대시보드
                        {/* <span className="ml-2 text-sm font-normal text-gray-400">
                            {isSv ? '[SV 모드]' : '[관리자 모드]'}
                        </span> */}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        점포 매출, 마진율, 객단가 등 핵심 성과 지표(KPI)를 분석합니다.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <div className="flex items-center px-2 text-gray-400">
                        <Filter className="w-4 h-4 mr-2" />
                        <span className="text-xs font-medium">필터</span>
                    </div>
                    <div className="h-4 w-[1px] bg-gray-200"></div>
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="text-sm border-none focus:ring-0 bg-transparent text-gray-700 font-medium cursor-pointer"
                        disabled={isSv}
                    >
                        {isSv ? (
                            <>
                                <option value="all">전체 지역</option>
                                <option value="서울/경기">서울/경기</option>
                                <option value="부산/경남">부산/경남</option>
                            </>
                        ) : (
                            <option value="all">담당 전체 지역</option>
                        )}
                    </select>
                    <div className="h-4 w-[1px] bg-gray-200"></div>
                    <div className="flex bg-gray-100 rounded p-1">
                        <button
                            onClick={() => setPeriod('week')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${period === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            1주일
                        </button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-3 py-1 text-xs font-bold rounded transition-all ${period === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            1개월
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <KPICard
                    title="총 매출"
                    value={`${(aggregatedData.totalRev / 10000).toLocaleString()}만원`}
                    icon={DollarSign}
                    trend={aggregatedData.growth}
                    trendLabel={isSv ? "2주 전 대비" : "2주 전 대비"}
                    color="blue"
                />
                <KPICard
                    title="평균 마진율"
                    value={`${aggregatedData.marginRate.toFixed(1)}%`}
                    icon={Percent}
                    trend={0.5}
                    trendLabel={""}
                    color="indigo"
                />
                <KPICard
                    title="평균 객단가 (AOV)"
                    value={`${aggregatedData.aov.toLocaleString()}원`}
                    icon={ShoppingBag}
                    trend={-1.2}
                    trendLabel={isSv ? "2주 전 대비" : "2주 전 대비"}
                    color="purple"
                />
                <KPICard
                    title="총 주문 건수"
                    value={`${aggregatedData.totalOrders.toLocaleString()}건`}
                    icon={Users}
                    trend={aggregatedData.growth}
                    trendLabel={isSv ? "2주 전 대비" : "2주 전 대비"}
                    color="orange"
                />
            </div>

            {/* Combined Analysis Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">매출 및 마진 추이 분석</h3>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center text-xs text-gray-500">
                                <span className="w-3 h-3 bg-blue-500 rounded-sm mr-1"></span> 매출
                                <span className="w-6 h-0.5 bg-purple-500 mx-2"></span> 마진
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={aggregatedData.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(val) => val.slice(5)}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    labelFormatter={(val) => val}
                                    formatter={(value: any, name: any) => [
                                        `${Number(value).toLocaleString()}원`,
                                        name === 'revenue' ? '매출' : '마진'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line yAxisId="right" type="monotone" dataKey="margin" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top/Bottom 5 Widget */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">점포 랭킹</h3>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setRankSort('top')}
                                className={`px-2 py-1 text-xs font-bold rounded ${rankSort === 'top' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                Top 5
                            </button>
                            <button
                                onClick={() => setRankSort('bottom')}
                                className={`px-2 py-1 text-xs font-bold rounded ${rankSort === 'bottom' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                            >
                                Low 5
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-4">
                            {sortedStores.slice(0, 5).map((store, idx) => (
                                <div key={store.id} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${rankSort === 'top' ? (idx < 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500') : 'bg-red-50 text-red-600'}`}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition-colors">
                                                <Link href={`/performance/${store.id}`}>{store.name}</Link>
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500">{store.region}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900">{(store.revenue / 10000).toLocaleString()}만</p>
                                        <p className={`text-xs font-medium ${store.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {store.growth > 0 ? '+' : ''}{store.growth}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* Full Store List Table (Admin) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                    className="p-6 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsListExpanded(!isListExpanded)}
                >
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        성과 리스트 (상세)
                        <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            Total {storeMetrics.length}
                        </span>
                    </h3>
                    {isListExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>

                {isListExpanded && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-3 cursor-pointer hover:text-gray-700">점포명</th>
                                    <th className="px-6 py-3">지역</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">매출</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">마진 (마진율)</th>
                                    <th className="px-6 py-3 text-right cursor-pointer hover:text-gray-700">성장률</th>
                                    <th className="px-6 py-3 text-center">상세</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {/* Sort by revenue desc default */}
                                {[...storeMetrics].sort((a, b) => b.revenue - a.revenue).map((store) => (
                                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900">
                                            {store.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{store.region}</td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {(store.revenue).toLocaleString()}원
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(store.margin).toLocaleString()}원
                                            <span className="text-xs text-gray-400 ml-1">({store.marginRate.toFixed(1)}%)</span>
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${store.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {store.growth > 0 ? '+' : ''}{store.growth}%
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link
                                                href={`/performance/${store.id}`}
                                                className="text-blue-600 hover:text-blue-800 text-xs font-bold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                            >
                                                상세
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, trendLabel, color }: any) {
    const isPositive = trend >= 0;
    const colorClass = {
        blue: 'text-blue-600 bg-blue-50',
        indigo: 'text-indigo-600 bg-indigo-50',
        purple: 'text-purple-600 bg-purple-50',
        orange: 'text-orange-600 bg-orange-50',
    }[color as string] || 'text-gray-600 bg-gray-50';

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px] hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className={`p-2 rounded-lg ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
                <span className={`font-bold flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(trend).toFixed(1)}%
                </span>
                <span className="text-gray-400">{trendLabel}</span>
            </div>
        </div>
    );
}
