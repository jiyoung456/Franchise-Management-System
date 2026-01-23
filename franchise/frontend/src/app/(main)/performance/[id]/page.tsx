'use client';

import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_POS_DATA } from '@/lib/mock/mockPosData';
import { MOCK_PERFORMANCE } from '@/lib/mock/mockSalesData';
import { useParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import {
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area
} from 'recharts';
import { ArrowLeft, Info, FileText } from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';

export default function PerformanceDetailPage() {
    const params = useParams();
    const router = useRouter();
    // Use 'id' from params
    const paramId = params?.id;
    const storeId = Array.isArray(paramId) ? paramId[0] : paramId;

    // State
    const [chartTab, setChartTab] = useState<'revenue' | 'growth' | 'order_aov'>('revenue');
    const [period, setPeriod] = useState<'week' | 'month'>('month');
    const [showBaseline, setShowBaseline] = useState(true);

    if (!storeId) return <div className="p-8">Store ID missing</div>;

    // Data Fetching
    const store = MOCK_STORES.find(s => s.id === storeId);
    const posData = MOCK_POS_DATA[storeId] || MOCK_POS_DATA['1'];
    const perfData = MOCK_PERFORMANCE[storeId] || MOCK_PERFORMANCE['1'];

    if (!store) return <div className="p-8">Store Not Found</div>;
    // Defensive check
    if (!posData || !perfData) return <div className="p-8">Loading Data...</div>;

    // Process Chart Data
    const chartData = useMemo(() => {
        if (!posData?.dailySales) return [];
        const days = period === 'month' ? 30 : 7;
        const raw = posData.dailySales.slice(-days);

        return raw.map((day, idx) => {
            // Mock Growth calculations
            const prevDayRevnue = idx > 0 ? raw[idx - 1].revenue : day.revenue;
            const growthRate = idx > 0 ? ((day.revenue - prevDayRevnue) / prevDayRevnue) * 100 : 0;

            return {
                ...day,
                dateShort: day.date.slice(5), // Remove year
                growthRate: parseFloat(growthRate.toFixed(1)),
                baseline: 800000 // Mock Baseline 800k
            };
        });
    }, [posData, period]);

    // Metrics Checks (Fail-safe)
    const currentMonthRev = perfData?.monthlySummary?.totalSales || 0;
    const salesGrowth = perfData?.monthlySummary?.salesGrowth || 0;

    const dailyLen = perfData?.dailySales?.length || 0;
    const currentDaily = dailyLen > 0 ? perfData.dailySales[dailyLen - 1] : { aov: 0, orders: 0 };
    const prevDaily = dailyLen > 1 ? perfData.dailySales[dailyLen - 2] : currentDaily;

    const aov = currentDaily.aov;
    const prevAov = prevDaily.aov || 1;
    const aovGrowth = ((aov - prevAov) / prevAov) * 100;

    const orders = currentDaily.orders;
    const prevOrders = prevDaily.orders || 1;
    const orderGrowth = ((orders - prevOrders) / prevOrders) * 100;

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
                    <StatusBadge status={store.currentState === 'NORMAL' ? '정상' : store.currentState === 'WATCHLIST' ? '관찰' : '위험'} />
                </div>

                {/* Filter Placeholder */}
                <div className="bg-white border border-gray-200 shadow-sm flex items-center px-6 h-full flex-1 rounded-lg">
                    <span className="font-bold text-gray-700 mr-2">필터</span>
                    <div className="flex bg-gray-100 rounded p-1 ml-auto">
                        <button
                            onClick={() => setPeriod('week')}
                            className={`px-3 py-1 text-xs font-bold rounded ${period === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >주</button>
                        <button
                            onClick={() => setPeriod('month')}
                            className={`px-3 py-1 text-xs font-bold rounded ${period === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
                        >월</button>
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
                            <p className="text-sm text-gray-500 font-bold mb-1">월 / 주 매출</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(currentMonthRev)}원</span>
                                <span className={`text-sm font-bold mb-1 ${salesGrowth >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                    ({salesGrowth >= 0 ? '+' : ''}{salesGrowth}%)
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">전월 / 전주 대비 증감률</p>
                        </div>
                        <hr className="border-gray-100" />
                        {/* AOV */}
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">평균 객단가</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(aov)}원</span>
                                <span className={`text-sm font-bold mb-1 ${aovGrowth >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                    ({aovGrowth >= 0 ? '+' : ''}{aovGrowth.toFixed(1)}%)
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">전월 / 전주 대비 변화율</p>
                        </div>
                        <hr className="border-gray-100" />
                        {/* Orders */}
                        <div>
                            <p className="text-sm text-gray-500 font-bold mb-1">총 주문수</p>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(orders)}건</span>
                                <span className={`text-sm font-bold mb-1 ${orderGrowth >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                    ({orderGrowth >= 0 ? '+' : ''}{orderGrowth.toFixed(1)}%)
                                </span>
                            </div>
                            <p className="text-xs text-gray-400">전월 / 전주 대비 주문수 변화율</p>
                        </div>
                    </div>

                    {/* Insight Box */}
                    <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                            <Info className="w-4 h-4 mr-2 text-blue-500" /> AI Insight
                        </h3>
                        <ul className="space-y-3">
                            <li className="text-sm text-gray-700 bg-red-50 p-2 rounded border border-red-100 font-medium">
                                최근 2주 연속 매출 하락세 감지
                            </li>
                            <li className="text-sm text-gray-700 bg-orange-50 p-2 rounded border border-orange-100 font-medium">
                                기준선(Baseline) 대비 매출 15% 하락
                            </li>
                        </ul>
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
                            onClick={() => setChartTab('revenue')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'revenue' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            매출 추이
                        </button>
                        <button
                            onClick={() => setChartTab('growth')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'growth' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            증감률 추이
                        </button>
                        <button
                            onClick={() => setChartTab('order_aov')}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${chartTab === 'order_aov' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            주문수 / 객단가 추이
                        </button>
                    </div>

                    {/* Chart Area */}
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="dateShort" tick={{ fontSize: 12 }} />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(val) => chartTab === 'growth' ? `${val}%` : val >= 10000 ? `${val / 10000}만` : val}
                                    tick={{ fontSize: 12 }}
                                    domain={['auto', 'auto']}
                                />
                                {chartTab === 'order_aov' && (
                                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                                )}
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                    formatter={(val: any) => chartTab === 'growth' ? `${val}%` : Number(val).toLocaleString()}
                                />
                                <Legend />

                                {showBaseline && chartTab === 'revenue' && (
                                    <ReferenceLine yAxisId="left" y={800000} stroke="orange" strokeDasharray="3 3" label={{ value: 'Baseline', fill: 'orange', fontSize: 10, position: 'insideTopRight' }} />
                                )}

                                {chartTab === 'revenue' && (
                                    <Area yAxisId="left" type="monotone" dataKey="revenue" fill="#eff6ff" stroke="#3b82f6" strokeWidth={3} name="매출" dot={{ r: 3 }} activeDot={{ r: 6 }} />
                                )}

                                {chartTab === 'growth' && (
                                    <Line yAxisId="left" type="monotone" dataKey="growthRate" stroke="#ef4444" strokeWidth={3} name="증감률(%)" dot={{ r: 3 }} />
                                )}

                                {chartTab === 'order_aov' && (
                                    <>
                                        <Bar yAxisId="left" dataKey="orderCount" fill="#3b82f6" name="주문수" barSize={30} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="aov" stroke="#8b5cf6" strokeWidth={3} name="객단가" />
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

export async function generateStaticParams() {
    return MOCK_STORES.map((store) => ({
        id: store.id,
    }));
}
