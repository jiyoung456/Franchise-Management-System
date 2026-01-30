'use client';

import { useEffect, useState } from 'react';
import { PosService, PosKpiDashboardResponse } from '@/services/posService';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Minus } from 'lucide-react';

interface StorePosSummaryProps {
    storeId: number;
}

export function StorePosSummary({ storeId }: StorePosSummaryProps) {
    const [data, setData] = useState<PosKpiDashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await PosService.getDashboard(storeId, 'MONTH');
                setData(res);
            } catch (e) {
                console.error("Failed to load POS summary", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [storeId]);

    if (loading) return <div className="col-span-3 text-center py-8 text-gray-400">Loading...</div>;
    if (!data) return <div className="col-span-3 text-center py-8 text-gray-400">데이터가 없습니다.</div>;

    const { summary } = data;

    const Card = ({ title, value, rate, icon: Icon, color }: any) => (
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-bold text-gray-500 mb-1">{title}</p>
                    <h4 className="text-2xl font-extrabold text-gray-900">{value}</h4>
                </div>
                <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Icon className={`w-5 h-5 text-${color}-500`} />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
                <span className={`flex items-center text-sm font-bold ${rate > 0 ? 'text-red-500' : rate < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
                    {rate > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : rate < 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                    {rate > 0 ? '+' : ''}{Number(rate).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-400">전월 대비</span>
            </div>
        </div>
    );

    return (
        <>
            <Card
                title="이번 달 매출"
                value={`${(summary.totalSales / 10000).toLocaleString()}만원`}
                rate={summary.totalSalesRate}
                icon={DollarSign}
                color="blue"
            />
            <Card
                title="총 주문 건수"
                value={`${summary.totalOrders.toLocaleString()}건`}
                rate={summary.totalOrdersRate}
                icon={Users}
                color="orange"
            />
            <Card
                title="평균 객단가"
                value={`${summary.aov.toLocaleString()}원`}
                rate={summary.aovRate}
                icon={ShoppingBag}
                color="purple"
            />
        </>
    );
}
