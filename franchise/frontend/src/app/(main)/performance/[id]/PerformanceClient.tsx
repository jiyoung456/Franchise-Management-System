'use client';

import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area
} from 'recharts';
import { ArrowLeft, Info, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { PosService, PosKpiDashboardResponse } from '@/services/posService';
import { StoreService } from '@/services/storeService';
import { StorageService } from '@/lib/storage';
import { StoreDetail } from '@/types';

export default function PerformanceClient({ id }: { id: string }) {
    const router = useRouter();
    const storeId = id;

    // State
    const [chartTab, setChartTab] = useState<'SALES' | 'GROWTH' | 'ORDERS'>('SALES');
    const [period, setPeriod] = useState<'WEEK' | 'MONTH'>('MONTH');
    const [showBaseline, setShowBaseline] = useState(true);
    const [store, setStore] = useState<StoreDetail | null>(null);
    const [dashboardData, setDashboardData] = useState<PosKpiDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSv, setIsSv] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            if (!storeId) return;
            setLoading(true);

            // Check User Role
            StorageService.init();
            const user = StorageService.getCurrentUser();
            if (user?.role === 'SUPERVISOR') {
                setIsSv(true);
            }

            try {
                const [storeInfo, posInfo] = await Promise.all([
                    StoreService.getStore(storeId),
                    PosService.getDashboard(Number(storeId), period)
                ]);
                setStore(storeInfo);
                setDashboardData(posInfo);
            } catch (error) {
                console.error("Failed to load performance data", error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [storeId, period]);

    if (loading) return <div className="p-12 text-center text-gray-500">데이터를 불러오는 중입니다...</div>;
    if (!store) return <div className="p-12 text-center text-gray-500">점포 정보를 찾을 수 없습니다.</div>;

    // Prepare Chart Data (Matching StoreKPICard logic)
    const chartData = dashboardData ? (() => {
        if (chartTab === 'SALES') {
            return dashboardData.salesTrend.map(t => ({ name: t.label, sales: t.value }));
        } else if (chartTab === 'GROWTH') {
            return dashboardData.salesChangeTrend.map(t => ({ name: t.label, growth: t.value }));
        } else {
            return dashboardData.ordersAndAovTrend.map(t => ({ name: t.label, orders: t.orders, atv: t.aov }));
        }
    })() : [];

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

    const baseline = dashboardData?.baseline;
    const formatCurrency = (val: number) => new Intl.NumberFormat('ko-KR').format(val);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* 1. Header Row */}
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-16 items-center">
                {/* Store Name Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex items-center px-6 h-full min-w-[300px] rounded-lg">
                    <h1 className="text-xl font-bold text-gray-900">점포 명 : {store.name}</h1>
                </div>

                {/* Status Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex items-center px-6 h-full min-w-[200px] rounded-lg gap-2">
                    <span className="font-bold text-gray-700">상태 :</span>
                    <StatusBadge status={store.state === 'NORMAL' ? '정상' : store.state === 'WATCHLIST' ? '관찰' : '위험'} />
                </div>

                {/* Filter Box */}
                <div className="bg-white border border-gray-200 shadow-sm flex items-center px-6 h-full flex-1 rounded-lg">
                    <span className="font-bold text-gray-700 mr-2">조회 기간</span>
                    <div className="flex bg-gray-100 rounded p-1 ml-auto">
                        <button
                            onClick={() => setPeriod('WEEK')}
                            className={`px-4 py-1 text-sm font-bold rounded transition-all ${period === 'WEEK' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >주간</button>
                        <button
                            onClick={() => setPeriod('MONTH')}
                            className={`px-4 py-1 text-sm font-bold rounded transition-all ${period === 'MONTH' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >월간</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Metrics & Insight */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Metrics Box */}
                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg space-y-6">
                        {/* Revenue */}
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">총 매출</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-extrabold text-gray-900">{(metrics.sales / 10000).toLocaleString()}만원</span>
                                <span className={`text-sm font-bold mb-1 flex items-center ${metrics.salesGrowth >= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                    {metrics.salesGrowth >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                                    {Math.abs(metrics.salesGrowth)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">전{period === 'WEEK' ? '주' : '월'} 대비</p>
                        </div>
                        <hr className="border-gray-100" />
                        {/* AOV */}
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">평균 객단가 (AOV)</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">{metrics.atv.toLocaleString()}원</span>
                                <span className={`text-sm font-bold mb-1 flex items-center ${metrics.atvGrowth >= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                    {metrics.atvGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metrics.atvGrowth)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">전{period === 'WEEK' ? '주' : '월'} 대비</p>
                        </div>
                        <hr className="border-gray-100" />
                        {/* Orders */}
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">총 주문수</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">{metrics.orders.toLocaleString()}건</span>
                                <span className={`text-sm font-bold mb-1 flex items-center ${metrics.ordersGrowth >= 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                    {metrics.ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                    {Math.abs(metrics.ordersGrowth)}%
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">전{period === 'WEEK' ? '주' : '월'} 대비</p>
                        </div>
                    </div>




                    {/* Go to Detail Button */}
                    <button
                        onClick={() => router.push(`/stores/${store.id}`)}
                        className="w-full py-4 bg-white border-2 border-gray-800 text-gray-900 rounded-lg font-bold text-lg hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                        점포 상세 보기 <FileText className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => router.push('/performance')}
                        className="w-full py-3 text-gray-500 text-sm hover:text-gray-900 flex items-center justify-center gap-1"
                    >
                        <ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기
                    </button>
                </div>

                {/* Right Column: Chart */}
                <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm p-6 rounded-lg flex flex-col h-[600px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-900">성과 추이 그래프</h2>
                        <button
                            onClick={() => setShowBaseline(!showBaseline)}
                            className={`px-3 py-1 text-xs font-bold border rounded transition-colors ${showBaseline ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-500 border-gray-300'}`}
                        >
                            기준선 {showBaseline ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    {/* Chart Tabs */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            onClick={() => setChartTab('SALES')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'SALES' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            매출 추이
                        </button>
                        <button
                            onClick={() => setChartTab('GROWTH')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'GROWTH' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            매출 증감률 추이
                        </button>
                        <button
                            onClick={() => setChartTab('ORDERS')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'ORDERS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            주문수 & 객단가
                        </button>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(val) => chartTab === 'GROWTH' ? `${val}%` : val >= 10000 ? `${val / 10000}만` : val}
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                {chartTab === 'ORDERS' && (
                                    <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val / 10000}만`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                )}
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: any, name: any) => [
                                        name === 'sales' || name === 'atv' ? `${(value).toLocaleString()}원` : name === 'orders' ? `${value}건` : `${value}%`,
                                        name === 'sales' ? '매출' : name === 'atv' ? '객단가' : name === 'orders' ? '주문수' : '증감률'
                                    ]}
                                />
                                <Legend verticalAlign="top" height={36} />

                                {chartTab === 'SALES' && (
                                    <>
                                        <Area yAxisId="left" type="monotone" dataKey="sales" fill="#eff6ff" stroke="#3b82f6" strokeWidth={3} name="sales" dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                        {showBaseline && baseline?.salesBaseline && (
                                            <ReferenceLine yAxisId="left" y={baseline.salesBaseline} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'right', value: '기준선', fontSize: 10, fill: '#9ca3af' }} />
                                        )}
                                    </>
                                )}

                                {chartTab === 'GROWTH' && (
                                    <>
                                        <ReferenceLine yAxisId="left" y={0} stroke="#666" />
                                        <Line yAxisId="left" type="monotone" dataKey="growth" stroke="#ef4444" strokeWidth={3} name="growth" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        {showBaseline && baseline?.salesWarnRate && (
                                            <ReferenceLine yAxisId="left" y={baseline.salesWarnRate} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '경고', fontSize: 10, fill: '#ef4444' }} />
                                        )}
                                    </>
                                )}

                                {chartTab === 'ORDERS' && (
                                    <>
                                        <Bar yAxisId="left" dataKey="orders" fill="#82ca9d" name="orders" barSize={30} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="atv" stroke="#8884d8" strokeWidth={3} name="atv" dot={{ r: 3 }} />
                                        {showBaseline && baseline?.ordersBaseline && (
                                            <ReferenceLine yAxisId="left" y={baseline.ordersBaseline} stroke="#9ca3af" strokeDasharray="3 3" label={{ position: 'right', value: '기준', fontSize: 10, fill: '#9ca3af' }} />
                                        )}
                                    </>
                                )}
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
