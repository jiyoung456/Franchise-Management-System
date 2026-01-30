'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import { ActionService } from '@/services/actionService';
import { ActionEffectResponse } from '@/types';

interface ActionEffectPageProps {
    params: {
        id: string;
    };
}

export default function ActionEffectPage({ params }: ActionEffectPageProps) {
    const router = useRouter();
    const actionId = params.id;
    const [effectData, setEffectData] = useState<ActionEffectResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDate = async () => {
            try {
                const data = await ActionService.getActionEffect(actionId);
                setEffectData(data);
            } catch (error) {
                console.error("Failed to load action effect", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDate();
    }, [actionId]);

    if (loading) return <div className="p-20 text-center text-gray-500">데이터 분석 중...</div>;
    if (!effectData) return <div className="p-20 text-center text-gray-500">분석 데이터를 불러올 수 없습니다.</div>;

    // Combine series for Chart
    // Assuming storeSeries and baselineSeries have matching dates or close enough ranges
    const chartData = effectData.storeSeries.map((item, idx) => {
        const baseline = effectData.baselineSeries[idx] ? effectData.baselineSeries[idx].value : 0;
        return {
            date: item.date,
            storeValue: item.value,
            baselineValue: baseline
        };
    });

    const isPositive = effectData.improvementRate > 0;
    const isNegative = effectData.improvementRate < 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 효과 분석</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Metric Summary Card */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="text-gray-500 font-bold mb-4">전후 비교 ({effectData.targetMetricCode})</h3>

                        <div className="flex items-end justify-between mb-2">
                            <span className="text-sm text-gray-600">조치 전</span>
                            <span className="text-xl font-medium text-gray-700">{effectData.preActionValue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-end justify-between mb-4 border-b border-gray-100 pb-4">
                            <span className="text-sm text-gray-600">조치 후</span>
                            <span className="text-2xl font-bold text-gray-900">{effectData.postActionValue.toLocaleString()}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 font-medium">개선율</span>
                            <div className={`flex items-center gap-1 text-lg font-bold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-500'}`}>
                                {isPositive && <TrendingUp className="w-5 h-5" />}
                                {isNegative && <TrendingDown className="w-5 h-5" />}
                                {!isPositive && !isNegative && <Minus className="w-5 h-5" />}
                                {effectData.improvementRate > 0 ? '+' : ''}{effectData.improvementRate.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h3 className="text-blue-800 font-bold mb-2">분석 코멘트</h3>
                        <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-line">
                            {effectData.analysisComment}
                        </p>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[400px]">
                    <h3 className="text-gray-700 font-bold mb-6">추세 분석 그래프</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid stroke="#eee" strokeDasharray="5 5" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(val) => val.slice(5)}
                                />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line
                                    type="monotone"
                                    dataKey="storeValue"
                                    name="대상 점포"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="baselineValue"
                                    name="평균(Baseline)"
                                    stroke="#9ca3af"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
