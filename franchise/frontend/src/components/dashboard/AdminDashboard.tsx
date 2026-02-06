'use client';

import React, { useEffect, useState } from 'react';
import {
    Users, Siren, Search, Calendar, ChevronRight, TrendingUp, TrendingDown,
    CreditCard, ShoppingBag, Activity, ClipboardCheck, AlertTriangle
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { DashboardService } from '@/services/dashboardService';
import { AdminDashboardSummary } from '@/types';
import AdminStoreDrawer from './AdminStoreDrawer';

// --- MOCK FALLBACK DATA ---
const MOCK_RISK_DISTRIBUTION = [
    { name: '정상 (Normal)', value: 85, color: '#10b981' },
    { name: '관찰 (Watch)', value: 12, color: '#f59e0b' },
    { name: '위험 (Risk)', value: 3, color: '#ef4444' },
];

const MOCK_TOP_RISK = [
    { storeId: 101, storeName: '강남역점', riskScore: 88 },
    { storeId: 102, storeName: '서초 1호점', riskScore: 82 },
    { storeId: 103, storeName: '부산 서면점', riskScore: 79 },
    { storeId: 104, storeName: '홍대입구점', riskScore: 75 },
    { storeId: 105, storeName: '잠실 송파점', riskScore: 72 },
];

const MOCK_POS_METRICS = [
    { label: '총 매출', value: '42.5억', diff: 12.5, isPositive: true },
    { label: '평균 마진율', value: '24.2%', diff: -1.2, isPositive: false },
    { label: '평균 객단가(AOV)', value: '18,500원', diff: 3.4, isPositive: true },
    { label: '총 주문 건수', value: '24.5만건', diff: 8.1, isPositive: true },
];

const MOCK_QSC_METRICS = [
    { label: '평균 QSC', value: '88.5점', sub: '전월 대비 +1.2' },
    { label: '점검 완료율', value: '94%', sub: '목표 95% 미달' },
    { label: '불합격 점포', value: '8개', sub: '전주 대비 -2개' },
    { label: 'S/A 등급 비율', value: '62%', sub: '전체 점포 중' },
];

// --- COMPONENTS ---

export default function AdminDashboard() {
    const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStore, setSelectedStore] = useState<any | null>(null);

    // Fetch Data (Keep existing pattern)
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

    // Merge Real Data with Mock Fallbacks
    const totalStores = summary?.totalStoreCount ?? 342; // Fallback to realistic mock number
    const riskStores = summary?.riskStoreCount ?? 5;
    const topRiskList = (summary?.riskTopStores && summary.riskTopStores.length > 0)
        ? summary.riskTopStores
        : MOCK_TOP_RISK;

    const riskPercent = ((riskStores / totalStores) * 100).toFixed(1);

    if (loading) return <div className="p-12 text-center text-gray-500">Loading Dashboard...</div>;

    return (
        <div className="space-y-8 pb-20 font-sans">

            {/* 0. Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">전사 모니터링 (Admin)</h1>
                    <p className="text-sm text-gray-500 mt-1">프랜차이즈 전체 운영 현황과 리스크를 실시간으로 조망합니다.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        <span className="text-sm font-bold text-gray-700">이번달 (2025.09)</span>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="점포명 검색..."
                            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* 1. Main KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">전체 가맹점 수</p>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{totalStores}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                </div>

                <div className="p-6 bg-white rounded-xl border border-red-100 shadow-sm flex items-center justify-between relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-red-500" />
                    <div>
                        <p className="text-sm font-bold text-red-600">위험 감지 점포 (RISK)</p>
                        <div className="flex items-baseline gap-2 mt-1">
                            <h3 className="text-3xl font-extrabold text-red-600">{riskStores}</h3>
                            <span className="text-sm text-red-400 font-medium">({riskPercent}%)</span>
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 animate-pulse">
                        <Siren size={24} />
                    </div>
                </div>
            </div>

            {/* 2. Risk Distribution & Top 5 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Risk Distribution Chart */}
                <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={20} className="text-gray-600" />
                        전체 리스크 등급 분포
                    </h3>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_RISK_DISTRIBUTION} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 14, fontWeight: 'bold', fill: '#4b5563' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" barSize={40} radius={[0, 4, 4, 0]}>
                                    {MOCK_RISK_DISTRIBUTION.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>

                {/* Right: Top 5 Risk Stores */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <AlertTriangle size={20} className="text-red-500" />
                            위험 점포 TOP 5
                        </h3>
                        <span className="text-xs text-gray-400 font-medium">*리스크 점수 기준</span>
                    </div>

                    <div className="space-y-2">
                        {topRiskList.map((store: any, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedStore(store)}
                                className="group flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 cursor-pointer transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${idx < 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                                        {store.storeName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-extrabold text-red-600">{store.riskScore}점</span>
                                    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* 3. POS Metrics */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-600" />
                    주문/매출 지표 (POS)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {MOCK_POS_METRICS.map((metric, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">{metric.label}</p>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-2xl font-extrabold text-gray-900">{metric.value}</span>
                            </div>
                            <div className={`flex items-center text-xs font-bold ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                                <span>{metric.diff > 0 ? '+' : ''}{metric.diff}%</span>
                                <span className="text-gray-400 font-medium ml-1">vs 지난달</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. QSC Metrics */}
            <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-purple-600" />
                    품질/서비스 지표 (QSC)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Unique Card Design for QSC */}
                    {MOCK_QSC_METRICS.map((metric, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-500 mb-2">{metric.label}</p>
                                <span className="text-2xl font-extrabold text-gray-900">{metric.value}</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className="text-xs text-gray-500 font-medium">{metric.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Drawer */}
            <AdminStoreDrawer
                isOpen={!!selectedStore}
                onClose={() => setSelectedStore(null)}
                data={selectedStore}
            />

        </div>
    );
}
