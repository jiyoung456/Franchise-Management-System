'use client';

import { useState, useEffect } from 'react';
import { StoreDetail } from '@/types';
import { X, ChevronRight, TrendingUp, TrendingDown, Info, ArrowLeft } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ComposedChart, Line, Bar } from 'recharts';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useRouter } from 'next/navigation';
import { PosService, PosKpiDashboardResponse } from '@/services/posService';

interface StoreKPICardProps {
    store: StoreDetail;
    onBack?: () => void;
    isModal?: boolean;
    embedded?: boolean;
}

export function StoreKPICard({ store, onBack, isModal = false, embedded = false }: StoreKPICardProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<'WEEK' | 'MONTH'>('WEEK');
    const [showBaseline, setShowBaseline] = useState(true);
    const [activeChartTab, setActiveChartTab] = useState<'SALES' | 'GROWTH' | 'ORDERS'>('SALES');
    const [dashboardData, setDashboardData] = useState<PosKpiDashboardResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const handleBack = () => {
        if (onBack) onBack();
        else router.back();
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            const data = await PosService.getDashboard(Number(store.id), filter);
            setDashboardData(data);
            setLoading(false);
        };
        loadData();
    }, [store.id, filter]);

    // Prepare Chart Data
    const chartData = dashboardData ? (() => {
        if (activeChartTab === 'SALES') {
            return dashboardData.salesTrend.map(t => ({ name: t.label, sales: t.value }));
        } else if (activeChartTab === 'GROWTH') {
            return dashboardData.salesChangeTrend.map(t => ({ name: t.label, growth: t.value }));
        } else {
            return dashboardData.ordersAndAovTrend.map(t => ({ name: t.label, orders: t.orders, atv: t.aov }));
        }
    })() : [];

    // Metrics Fallback (if loading or error)
    const metrics = dashboardData ? {
        sales: dashboardData.summary.totalSales,
        salesGrowth: dashboardData.summary.totalSalesRate,
        atv: dashboardData.summary.aov,
        atvGrowth: dashboardData.summary.aovRate,
        orders: dashboardData.summary.totalOrders,
        ordersGrowth: dashboardData.summary.totalOrdersRate
    } : {
        sales: 0, salesGrowth: 0,
        atv: 0, atvGrowth: 0,
        orders: 0, ordersGrowth: 0
    };

    // Baseline Data
    const baseline = dashboardData?.baseline;

    return (
        <div className={`flex flex-col ${isModal ? 'h-[85vh] rounded-xl overflow-hidden bg-gray-50' : embedded ? 'w-full h-full bg-transparent' : 'min-h-screen bg-gray-50'}`}>
            {/* Header */}
            <div className={`px-8 py-5 flex justify-between items-center z-10 shadow-sm ${isModal || !embedded ? 'bg-white border-b border-gray-200 sticky top-16' : 'bg-transparent mb-4 p-0 shadow-none justify-end'}`}>
                {!embedded && (
                    <div className="flex items-center gap-6">
                        {!isModal && (
                            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                {store.name}
                                <StatusBadge
                                    status={store.currentState === 'NORMAL' ? '정상' : store.currentState === 'WATCHLIST' ? '관찰' : '위험'}
                                    type={store.currentState === 'NORMAL' ? 'success' : store.currentState === 'WATCHLIST' ? 'warning' : 'danger'}
                                />
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">KPI 상세 분석 대시보드</p>
                        </div>
                    </div>
                )}

                <div className="bg-gray-100 p-1 rounded-lg flex text-sm font-medium relative ml-auto">
                    <button
                        onClick={() => setFilter('WEEK')}
                        className={`relative z-10 px-4 py-1.5 rounded-md transition-all duration-200 ${filter === 'WEEK' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        주간
                    </button>
                    <button
                        onClick={() => setFilter('MONTH')}
                        className={`relative z-10 px-4 py-1.5 rounded-md transition-all duration-200 ${filter === 'MONTH' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                    >
                        월간
                    </button>
                </div>
            </div>

            <div className={`flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-y-auto ${embedded ? 'p-0' : 'p-8'}`}>
                {/* Left Column: Metrics & Analysis */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Metrics Grid */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
                        {/* Sales */}
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">총 매출 (Total Sales)</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-extrabold text-gray-900">{(metrics.sales / 10000).toLocaleString()}만원</span>
                                <span className={`flex items-center text-sm font-bold ${metrics.salesGrowth >= 0 ? 'text-red-500' : 'text-blue-600'} `}>
                                    {metrics.salesGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    {Math.abs(metrics.salesGrowth)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">전{filter === 'WEEK' ? '주' : '월'} 대비</p>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* ATV */}
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">평균 객단가 (ATV)</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-gray-900">{metrics.atv.toLocaleString()}원</span>
                                <span className={`flex items-center text-sm font-bold ${metrics.atvGrowth >= 0 ? 'text-red-500' : 'text-blue-600'} `}>
                                    {metrics.atvGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metrics.atvGrowth)}%
                                </span>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100" />

                        {/* Order Count */}
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">총 주문수 (Orders)</p>
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl font-bold text-gray-900">{metrics.orders.toLocaleString()}건</span>
                                <span className={`flex items-center text-sm font-bold ${metrics.ordersGrowth >= 0 ? 'text-red-500' : 'text-blue-600'} `}>
                                    {metrics.ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metrics.ordersGrowth)}%
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Description Card */}
                    {dashboardData?.statusSummary && (
                        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${dashboardData.statusSummary.level === 'ALERT' ? 'border-red-100' : dashboardData.statusSummary.level === 'WARN' ? 'border-orange-100' : 'border-blue-100'}`}>
                            <div className={`px-6 py-4 border-b flex items-center gap-2 ${dashboardData.statusSummary.level === 'ALERT' ? 'bg-red-50 border-red-100 text-red-800' : dashboardData.statusSummary.level === 'WARN' ? 'bg-orange-50 border-orange-100 text-orange-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                                <Info className="w-5 h-5" />
                                <h3 className="font-bold">상태 분석 요약</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">주요 이슈</p>
                                    <p className="text-gray-900 font-bold text-lg">{dashboardData.statusSummary.title}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">세부 내용</p>
                                    <p className="text-gray-900 text-base">
                                        {dashboardData.statusSummary.detail}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Trend Graphs with Tabs */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
                    {/* Tabs Header */}
                    <div className="flex border-b border-gray-200 bg-gray-50/30">
                        <button
                            onClick={() => setActiveChartTab('SALES')}
                            className={`flex-1 py-5 text-center font-bold text-base transition-all relative ${activeChartTab === 'SALES' ? 'text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            매출 추이
                            {activeChartTab === 'SALES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                        </button>
                        <div className="w-px bg-gray-200 my-4" />
                        <button
                            onClick={() => setActiveChartTab('GROWTH')}
                            className={`flex-1 py-5 text-center font-bold text-base transition-all relative ${activeChartTab === 'GROWTH' ? 'text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            매출 증감률 추이
                            {activeChartTab === 'GROWTH' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                        </button>
                        <div className="w-px bg-gray-200 my-4" />
                        <button
                            onClick={() => setActiveChartTab('ORDERS')}
                            className={`flex-1 py-5 text-center font-bold text-base transition-all relative ${activeChartTab === 'ORDERS' ? 'text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            주문수 & 객단가
                            {activeChartTab === 'ORDERS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
                        </button>
                    </div>

                    {/* Chart Control Bar */}
                    <div className="px-8 py-6 flex justify-between items-center">
                        <span className="font-bold text-xl text-gray-800 tracking-tight">
                            {activeChartTab === 'SALES' && '주간/월간 매출 변화 그래프'}
                            {activeChartTab === 'GROWTH' && '전년 대비 매출 증감률 추이'}
                            {activeChartTab === 'ORDERS' && '주문 건수 및 객단가 변화'}
                        </span>

                        <label className="flex items-center cursor-pointer gap-3 select-none group">
                            <span className={`text-sm font-medium transition-colors ${showBaseline ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                기준선 보기
                            </span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showBaseline}
                                    onChange={() => setShowBaseline(!showBaseline)}
                                />
                                <div className={`w-12 h-7 rounded-full transition-colors border-2 ${showBaseline ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-200'}`} />
                                <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-200 transform ${showBaseline ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </label>
                    </div>

                    {/* Chart Area */}
                    <div className="p-6 h-[450px]">
                        {loading ? (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">Loading...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any, name: any) => [
                                            name === 'sales' || name === 'atv' ? `${(value).toLocaleString()} 원` : name === 'orders' ? `${value} 건` : `${value}% `,
                                            name === 'sales' ? '매출' : name === 'atv' ? '객단가' : name === 'orders' ? '주문수' : '증감률'
                                        ]}
                                    />

                                    {activeChartTab === 'SALES' && (
                                        <>
                                            <YAxis tickFormatter={(val) => `${val / 10000} 만`} axisLine={false} tickLine={false} fontSize={12} />
                                            <Area type="monotone" dataKey="sales" stroke="#46B3E6" fill="url(#colorSales)" strokeWidth={3} />
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#46B3E6" stopOpacity={0.2} />
                                                    <stop offset="95%" stopColor="#46B3E6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            {showBaseline && baseline?.salesBaseline && (
                                                <ReferenceLine y={baseline.salesBaseline} stroke="#999" strokeDasharray="3 3" label={{ position: 'right', value: '기준선', fontSize: 10, fill: '#999' }} />
                                            )}
                                        </>
                                    )}

                                    {activeChartTab === 'GROWTH' && (
                                        <>
                                            <YAxis tickFormatter={(val) => `${val}% `} axisLine={false} tickLine={false} fontSize={12} />
                                            <ReferenceLine y={0} stroke="#666" />
                                            <Line type="monotone" dataKey="growth" stroke="#ff7300" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            {showBaseline && baseline?.salesWarnRate && (
                                                <ReferenceLine y={baseline.salesWarnRate} stroke="#ff0000" strokeDasharray="3 3" label={{ position: 'right', value: '경고 기준', fontSize: 10, fill: '#f00' }} />
                                            )}
                                        </>
                                    )}

                                    {activeChartTab === 'ORDERS' && (
                                        <>
                                            <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} />
                                            <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val / 10000} 만`} axisLine={false} tickLine={false} fontSize={12} />
                                            <Bar yAxisId="left" dataKey="orders" fill="#82ca9d" radius={[4, 4, 0, 0]} barSize={30} name="orders" />
                                            <Line yAxisId="right" type="monotone" dataKey="atv" stroke="#8884d8" strokeWidth={3} name="atv" />
                                            {showBaseline && baseline?.ordersBaseline && (
                                                <ReferenceLine yAxisId="left" y={baseline.ordersBaseline} stroke="#999" strokeDasharray="3 3" label="기준 주문수" />
                                            )}
                                        </>
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

interface StoreKPIModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: StoreDetail;
}

export function StoreKPIModal({ isOpen, onClose, store }: StoreKPIModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[1400px] h-[90vh] flex flex-col relative overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6 text-gray-600" />
                </button>
                <StoreKPICard store={store} isModal={true} />
            </div>
        </div>
    );
}

