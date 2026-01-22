'use client';

import { use, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { ChevronRight, FileText, Share2, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceArea } from 'recharts';

interface Props {
    params: Promise<{ storeId: string }>;
}

export default function AiRiskDetailPage({ params }: Props) {
    const { storeId } = use(params);
    const router = useRouter();
    const profile = MOCK_RISK_PROFILES[storeId];

    if (!profile) notFound();

    // 1. Data Prep for Bar Chart (Category Breakdown)
    const categoryData = useMemo(() => {
        const categories = { QSC: 0, POS: 0, OPERATION: 0 };
        profile.factors.forEach(f => {
            // Map 'OPERATION' from mock data (which might be 'OPERATION' or 'POS' etc)
            // MockData Category: 'QSC' | 'POS' | 'OPERATION'
            if (categories[f.category as keyof typeof categories] !== undefined) {
                categories[f.category as keyof typeof categories] += f.impactScore;
            }
        });
        return [
            { name: 'QSC', score: categories.QSC, color: '#3b82f6' }, // Blue
            { name: 'POS', score: categories.POS, color: '#8b5cf6' }, // Violet
            { name: '운영', score: categories.OPERATION, color: '#f59e0b' }, // Amber
        ];
    }, [profile]);

    // 2. Data Prep for Line Chart (History)
    // Reverse history to show chronological order if needed, but mock history is likely date descending? 
    // Mock Logic says: date = date - (29 - i), so it IS chronological.
    // We want to format date to "MM/DD".
    const timelineData = useMemo(() => {
        return profile.history.map(h => ({
            date: h.date.slice(5), // Remove YYYY-
            score: h.score
        }));
    }, [profile]);

    const getStatusColor = (level: string) => {
        switch (level) {
            case 'NORMAL': return 'text-green-600 bg-white';
            case 'WATCHLIST': return 'text-orange-600 bg-white';
            case 'RISK': return 'text-red-600 bg-white';
            default: return 'text-gray-900 bg-white';
        }
    };

    const getStatusText = (level: string) => {
        switch (level) {
            case 'NORMAL': return '정상';
            case 'WATCHLIST': return '주의';
            case 'RISK': return '위험';
            default: return level;
        }
    };

    return (
        <div className="space-y-6 pb-20 mx-auto w-full">
            {/* Header: Risk Level, Title, Date */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${profile.riskLevel === 'RISK' ? 'bg-red-50 text-red-600 border-red-200' :
                            profile.riskLevel === 'WATCHLIST' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                'bg-green-50 text-green-600 border-green-200'
                            }`}>
                            {profile.riskLevel} 단계
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">{profile.storeName} 위험 진단 상세</h1>
                    </div>
                    <p className="text-sm text-gray-500 ml-1">
                        진단 일시: {new Date().toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Top Row: Store Info & Score & Chart */}
            <div className="grid grid-cols-12 gap-6 h-[280px]">
                {/* 1. Store Name */}
                <div className="col-span-2 bg-white border border-gray-300 shadow-sm flex items-center justify-center p-4">
                    <h2 className="text-xl font-bold text-gray-900 text-center">{profile.storeName}</h2>
                </div>

                {/* 2. Score */}
                <div className="col-span-2 bg-white border border-gray-300 shadow-sm flex items-center justify-center p-4">
                    <div className="text-center">
                        <span className="block text-5xl font-extrabold text-gray-900">{profile.totalRiskScore}점</span>
                        <span className="text-xs text-gray-500 mt-2">위험 점수</span>
                    </div>
                </div>

                {/* 3. Status */}
                <div className="col-span-2 bg-white border border-gray-300 shadow-sm flex items-center justify-center p-4">
                    <span className={`text-5xl font-extrabold ${getStatusColor(profile.riskLevel).split(' ')[0]}`}>
                        {getStatusText(profile.riskLevel)}
                    </span>
                </div>

                {/* 4. Timeline Chart */}
                <div className="col-span-6 bg-white border border-gray-300 shadow-sm p-4 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-700">주간 위험 점수 추이</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-100 border border-green-200"></div>
                                <span>정상 구간 (0-50)</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ borderRadius: '4px' }} />
                                {/* Normal Range Shading */}
                                <ReferenceArea y1={0} y2={50} fill="#dcfce7" fillOpacity={0.3} />
                                <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Breakdown & Report */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[300px]">
                {/* Left: Bar Chart (Breakdown) */}
                <div className="bg-white border border-gray-300 shadow-sm p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">항목별 위험 기여도</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 14, fontWeight: 'bold' }} width={60} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={40}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right: Report Section */}
                <div className="bg-white border border-gray-300 shadow-sm p-6 flex flex-col relative">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold text-gray-900">위험진단 리포트</h3>
                        <button
                            onClick={() => router.push(`/ai-insight/${storeId}/report`)}
                            className="px-4 py-2 border border-gray-300 rounded bg-white text-sm font-bold hover:bg-gray-50 flex items-center gap-1 shadow-sm transition-colors"
                        >
                            리포트 보기
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 p-6 flex flex-col justify-center">
                        <div className="flex items-start gap-4">
                            <BrainCircuit className="w-10 h-10 text-purple-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">AI 요약 분석</h4>
                                <p className="text-gray-700 leading-relaxed font-medium">
                                    "{profile.anomaly?.summary || '현재 특이사항이 발견되지 않았습니다. 전반적인 운영 지표가 안정적입니다.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
