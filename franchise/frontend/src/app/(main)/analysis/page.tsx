'use client';

import Link from 'next/link';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function KpiDashboardPage() {
    const kpis = [
        { title: '이번주 전체 매출', value: '₩425,000,000', change: '+12.5%', trend: 'up', icon: DollarSign },
        { title: '총 주문 수', value: '18,450건', change: '+5.2%', trend: 'up', icon: ShoppingBag },
        { title: '평균 객단가', value: '₩23,050', change: '-1.8%', trend: 'down', icon: Users },
        { title: '전체 점포 수', value: '142개', change: '+2개', trend: 'up', icon: TrendingUp },
    ];

    // Mock Chart Data
    const chartData = [
        { name: '월', sales: 45000000, orders: 1800 },
        { name: '화', sales: 52000000, orders: 2100 },
        { name: '수', sales: 49000000, orders: 1950 },
        { name: '목', sales: 58000000, orders: 2300 },
        { name: '금', sales: 72000000, orders: 2900 },
        { name: '토', sales: 85000000, orders: 3500 },
        { name: '일', sales: 64000000, orders: 2600 },
    ];

    // Mock performance data merging with store list for the table
    const storesWithPerf = MOCK_STORES.filter(s => s.state !== 'RISK').map(s => ({ // Simplified filter
        ...s,
        sales: Math.floor(Math.random() * 50000000) + 10000000,
        growth: (Math.random() * 20) - 10,
        margin: Math.floor(Math.random() * 15) + 15,
    }));

    // Sort by sales descending for the dashboard view
    const sortedStores = [...storesWithPerf].sort((a, b) => b.sales - a.sales).slice(0, 10);

    return (
        <div className="space-y-6">
            {/* ... Header and Cards (unchanged) ... */}
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">성과 분석 대시보드 (전사)</h1>
                <p className="text-sm text-gray-500 mt-1">전사 매출, 마진율, 객단가 등 핵심 성과 지표(KPI)를 분석합니다.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 ${kpi.trend === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
                            <kpi.icon className="w-16 h-16" />
                        </div>
                        <h3 className="text-sm font-medium text-gray-500 relative z-10">{kpi.title}</h3>
                        <div className="mt-2 flex items-baseline gap-2 relative z-10">
                            <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                        </div>
                        <div className={`mt-2 text-sm font-medium flex items-center relative z-10 ${kpi.trend === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
                            {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                            <span>{kpi.change}</span>
                            <span className="text-gray-400 ml-1 font-normal">vs 지난주</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Chart Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">주간 매출 및 주문 추이</h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
                            <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="right" dataKey="orders" name="주문 수" fill="#82ca9d" barSize={30} radius={[4, 4, 0, 0]} />
                            <Line yAxisId="left" type="monotone" dataKey="sales" name="매출 (원)" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Store Performance List (Merged from separate page) */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">점포별 성과 리스트 (Top 10)</h3>
                        <p className="text-sm text-gray-500">매출 상위 점포 현황입니다. 각 점포를 클릭하여 상세 원인 분석을 진행하세요.</p>
                    </div>
                    <Link href="/stores" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                        전체 점포 보기 &rarr;
                    </Link>
                </div>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3">점포명</th>
                            <th className="px-6 py-3">권역</th>
                            <th className="px-6 py-3">월 매출</th>
                            <th className="px-6 py-3">WoW 증감률</th>
                            <th className="px-6 py-3">이익률</th>
                            <th className="px-6 py-3 text-right">상세 분석</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                                <td className="px-6 py-4 text-gray-500">{store.region}</td>
                                <td className="px-6 py-4 font-bold">₩{store.sales.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <div className={`flex items-center ${store.growth >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                                        {store.growth >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                                        {store.growth.toFixed(1)}%
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{store.margin}%</td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/stores/${store.id}`}
                                        className="inline-flex items-center px-3 py-1.5 border border-gray-200 text-xs font-medium rounded-lg hover:bg-gray-100 text-gray-600"
                                    >
                                        분석 보기
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
