'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrainCircuit, AlertCircle, FileText } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import api from '@/lib/api';

interface Props {
    params: Promise<{ storeId: string; date: string }>;
}

const METRIC_NAMES: Record<string, string> = {
    'sales_avg_7d': '최근 7일 평균 매출',
    'order_growth_7d': '최근 7일 주문수 증감률',
    'aov_growth_7d': '최근 7일 객단가 증감률',
    'margin_rate_diff_7d': '최근 7일 마진율 변화',
    'sales_volatility_7d': '최근 7일 매출 변동성',
    'sales_vs_store_avg': '점포 평균 대비 매출 수준',
    'last_qsc_total_score': '최근 QSC 종합 점수',
    'days_since_last_qsc': 'QSC 점검 경과 일수',
    'qsc_diff_prev': 'QSC 점수 변화',
    'hygiene_risk_score': '위생 리스크 점수',
    'service_risk_score': '서비스 리스크 점수',
    'quality_risk_score': '품질 리스크 점수',
    'quality_diff_prev': '품질 점수 변화',
    'safety_risk_score': '안전 리스크 점수',
    'safety_diff_prev': '안전 점수 변화',
    'prev_qsc_total_score': '이전 QSC 종합 점수',
    'days_since_last_visit': 'SV 미방문 경과 일수',
    'open_action_cnt': '미조치 액션 건수',
    'overdue_action_cnt': '기한 초과 액션 건수',
    'action_completion_rate_30d': '30일 내 조치 완료율',
    'days_since_last_action': '최근 조치 경과 일수',
    'neg_event_cnt_30d': '최근 30일 부정 이벤트 수',
    'risk_event_cnt_30d': '최근 30일 위험 이벤트 수',
    'sales_drop_event_cnt_30d': '최근 30일 매출 급락 이벤트 수',
    'inspection_drop_event_cnt_30d': '최근 30일 점검 점수 하락 이벤트 수'
};

export default function AiRiskDateDetailPage({ params }: Props) {
    const { storeId, date } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const storeNameParam = searchParams.get('storeName');
    const displayStoreName = storeNameParam ? decodeURIComponent(storeNameParam) : `가맹점 ${storeId}`;

    const [detailData, setDetailData] = useState<any>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const decodedDate = decodeURIComponent(date);

                // Use api instance for Auth headers
                const [detailRes, historyRes] = await Promise.all([
                    api.get(`/risk/report/${storeId}/detail?snapshotDate=${decodedDate}`),
                    api.get(`/risk/report/${storeId}/history`)
                ]);

                if (detailRes.data) {
                    setDetailData(detailRes.data);
                }

                if (Array.isArray(historyRes.data)) {
                    setHistoryData(historyRes.data);
                } else if (historyRes.data?.history) {
                    setHistoryData(historyRes.data.history);
                }

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (storeId && date) {
            fetchData();
        }
    }, [storeId, date]);

    // 1. Data Prep for Bar Chart (SHAP Values)
    const categoryData = useMemo(() => {
        if (!detailData) return [];

        const items = [
            { key: detailData.top_metric_1, shap: detailData.top_metric_1_shap },
            { key: detailData.top_metric_2, shap: detailData.top_metric_2_shap },
            { key: detailData.top_metric_3, shap: detailData.top_metric_3_shap }
        ].filter(item => item.key);

        return items.map((item, idx) => ({
            name: METRIC_NAMES[item.key] || item.key,
            value: item.shap,
            color: item.shap > 0 ? '#ef4444' : '#3b82f6'
        }));
    }, [detailData]);

    // 2. Data Prep for Line Chart (History - Last 7 Days from snapshot_date)
    const timelineData = useMemo(() => {
        if (!historyData || historyData.length === 0) return [];

        const targetDate = new Date(decodeURIComponent(date));
        const sevenDaysAgo = new Date(targetDate);
        sevenDaysAgo.setDate(targetDate.getDate() - 7);

        return historyData
            .filter(h => {
                const d = new Date(h.snapshot_date);
                return d >= sevenDaysAgo && d <= targetDate;
            })
            .sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime())
            .map(h => ({
                date: h.snapshot_date.slice(5),
                riskLabel: h.risk_label
            }));
    }, [historyData, date]);

    const getRiskLevelText = (label: number) => {
        switch (label) {
            case 2: return '위험';
            case 1: return '주의';
            default: return '정상';
        }
    };

    const getRiskLevelColor = (label: number) => {
        switch (label) {
            case 2: return 'text-red-600 bg-red-50 border-red-200';
            case 1: return 'text-orange-600 bg-orange-50 border-orange-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    const getRiskLevelTextColor = (label: number) => {
        switch (label) {
            case 2: return 'text-red-600';
            case 1: return 'text-orange-600';
            default: return 'text-green-600';
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <div className="text-gray-500">분석 데이터를 불러오는 중입니다...</div>
            </div>
        );
    }

    if (!detailData && !error) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">데이터가 없습니다.</h3>
                <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 rounded">뒤로가기</button>
            </div>
        );
    }

    if (error && !detailData) {
        return (
            <div className="flex h-[400px] items-center justify-center flex-col gap-4">
                <AlertCircle className="w-16 h-16 text-gray-300" />
                <h3 className="text-lg font-bold text-gray-700">{error}</h3>
                <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 rounded">뒤로가기</button>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getRiskLevelColor(detailData.risk_label)}`}>
                            {getRiskLevelText(detailData.risk_label)} 단계
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">{displayStoreName} 위험 진단 상세</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-1">
                        진단 일시: {detailData.snapshot_date}
                    </p>
                </div>
            </div>

            {/* Content Row 1: Status Card & Timeline Chart */}
            <div className="grid grid-cols-12 gap-6 h-[280px]">
                {/* 1. Risk Status Card */}
                <div className="col-span-4 bg-white border border-gray-300 shadow-sm flex flex-col items-center justify-center p-4">
                    <h3 className="text-gray-500 font-medium mb-2">현재 위험 등급</h3>
                    <span className={`text-6xl font-extrabold ${getRiskLevelTextColor(detailData.risk_label)}`}>
                        {getRiskLevelText(detailData.risk_label)}
                    </span>
                    <div className="mt-4 text-sm text-gray-400">
                        {detailData.risk_label === 0 ? '안정적입니다' : detailData.risk_label === 1 ? '주의가 필요합니다' : '즉각적인 조치가 권장됩니다'}
                    </div>
                </div>

                {/* 2. Timeline Chart (Risk Label History) */}
                <div className="col-span-8 bg-white border border-gray-300 shadow-sm p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-700">최근 7일 위험 등급 추이</h3>
                        <div className="flex gap-2 text-xs text-gray-500">
                            <span>0: 정상</span>
                            <span>1: 주의</span>
                            <span>2: 위험</span>
                        </div>
                    </div>
                    {/* Explicitly set style={{ width: '100%', height: '100%' }} to parent of ResponsiveContainer */}
                    <div className="flex-1 w-full min-h-0" style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    interval="preserveStartEnd"
                                    padding={{ left: 30, right: 30 }}
                                />
                                <YAxis
                                    domain={[0, 2]}
                                    ticks={[0, 1, 2]}
                                    tickFormatter={(val) => val === 0 ? '정상' : val === 1 ? '주의' : '위험'}
                                    tick={{ fontSize: 11 }}
                                    padding={{ top: 20, bottom: 20 }}
                                />
                                <Tooltip
                                    formatter={(value: number) => [value === 0 ? '정상' : value === 1 ? '주의' : '위험', '등급']}
                                    contentStyle={{ borderRadius: '4px' }}
                                />
                                <Line
                                    type="stepAfter"
                                    dataKey="riskLabel"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#4f46e5' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Content Row 2: SHAP Bar Chart & AI Comment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[350px]">
                {/* Left: SHAP Bar Chart */}
                <div className="bg-white border border-gray-300 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">주요 위험 요인 기여도 (SHAP)</h3>
                    <div className="flex-1 w-full min-h-0" style={{ width: '100%', height: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                            <BarChart
                                data={categoryData}
                                layout="vertical"
                                margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{ fontSize: 12, fontWeight: 'medium' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    formatter={(value: number) => [value.toFixed(4), '기여도']}
                                />
                                <ReferenceLine x={0} stroke="#9ca3af" />
                                <Bar dataKey="value" barSize={30}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: AI Analysis Report */}
                <div className="bg-white border border-gray-300 shadow-sm p-6 flex flex-col relative">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">AI 요약 분석</h3>

                        {/* Detail Report Button */}
                        <button
                            onClick={() => router.push(`/ai-insight/${storeId}/report?date=${date}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-md hover:bg-indigo-100 transition-colors border border-indigo-100"
                        >
                            <FileText className="w-4 h-4" />
                            위험 진단 리포트
                        </button>
                    </div>

                    <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 p-6 flex flex-col justify-center">
                        <div className="flex items-start gap-4">
                            <BrainCircuit className="w-10 h-10 text-purple-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">분석 코멘트</h4>
                                <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-line">
                                    "{detailData.comment || '분석 코멘트가 존재하지 않습니다.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
