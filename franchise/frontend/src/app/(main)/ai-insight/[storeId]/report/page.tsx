'use client';

import { use, useEffect, useState } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { ArrowLeft, BrainCircuit, Download, ShieldAlert, AlertTriangle, CheckCircle, Info, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
    PieChart, Pie
} from 'recharts';

interface Props {
    params: Promise<{ storeId: string }>;
}

// -- Types --
interface RiskAnalysisData {
    commentNegativeScore: number; // 0-100
    topics: string[];
    riskKeywords: string[];
    summary: string;
}

// -- Mock Data Generators --
const getMockRiskData = (storeId: string): RiskAnalysisData => {
    return {
        commentNegativeScore: 78,
        topics: ['위생', '인력', '시설'],
        riskKeywords: ['악취', '청결불량', '응대지연', '유니폼미착용'],
        summary: '전반적인 매장 위생 상태가 우려되며, 특히 주방 악취와 홀 바닥 청결 문제가 심각합니다. 또한 피크타임 인력 부족으로 인한 응대 지연 및 직원 복장 규정 위반이 관찰되어 즉각적인 개선 조치가 필요합니다.'
    };
};

export default function RiskReportPage({ params }: Props) {
    const { storeId } = use(params);
    const router = useRouter();
    const profile = MOCK_RISK_PROFILES[storeId];

    const [riskData, setRiskData] = useState<RiskAnalysisData | null>(null);

    useEffect(() => {
        setRiskData(getMockRiskData(storeId));
    }, [storeId]);

    if (!profile || !riskData) return <div className="p-20 text-center">분석 중...</div>;

    // -- Chart Data (Restored) --
    const radarData = [
        { subject: '종합 위험도', A: profile.totalRiskScore, fullMark: 100 },
        { subject: 'QSC', A: 85, fullMark: 100 },
        { subject: '매출 안정성', A: 70, fullMark: 100 },
        { subject: '운영 효율', A: 90, fullMark: 100 },
        { subject: '고객 반응', A: 65, fullMark: 100 },
        { subject: '규정 준수', A: 95, fullMark: 100 },
    ];

    const qscData = [
        { name: '청결도', value: 40 },
        { name: '서비스', value: 30 },
        { name: '제품품질', value: 30 },
    ];
    const QSC_COLORS = ['#3b82f6', '#93c5fd', '#bfdbfe'];

    const posData = [
        { name: '매출하락', value: 60 },
        { name: '객단가', value: 25 },
        { name: '재방문', value: 15 },
    ];
    const POS_COLORS = ['#8b5cf6', '#c4b5fd', '#ddd6fe'];

    const opsData = [
        { name: '발주', value: 80 },
        { name: '인력', value: 45 },
        { name: '교육', value: 30 },
        { name: '시설', value: 60 },
    ];


    // Helper for Risk Level UI
    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: '심각 (Critical)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
        if (score >= 50) return { label: '주의 (Warning)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
        return { label: '양호 (Normal)', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    };

    const riskLevel = getRiskLevel(riskData.commentNegativeScore);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Action Bar (No-Print) */}
            <div className="bg-white border-b border-gray-200 sticky top-16 z-10 print:hidden">
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> 뒤로가기
                    </button>
                    <button
                        onClick={handlePrint}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        PDF 다운로드
                    </button>
                </div>
            </div>

            {/* A4 Paper Layout - Extended height for combined content */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg my-8 p-[10mm] min-h-[297mm] print:shadow-none print:my-0 print:w-full max-w-none">

                {/* Header */}
                <div className="border-b-2 border-gray-900 pb-4 mb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">위험 진단 리포트</h1>
                            <div className="text-sm font-bold text-gray-600 flex gap-4">
                                <span>점포명: <span className="text-gray-900">{profile.storeName}</span></span>
                                <span>진단일: <span className="text-gray-900">{new Date().toLocaleDateString()}</span></span>
                                <span>REPORT ID: <span className="text-gray-900">R-{storeId}-AI</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <BrainCircuit className="w-10 h-10 text-purple-600 ml-auto mb-1" />
                            <span className="text-xs font-bold text-purple-600">AI Risk Engine Powered</span>
                        </div>
                    </div>
                </div>

                {/* ===================================================================================
                   PART 1: Quantitative Data Analysis (Charts) - MOVED UP
                   =================================================================================== */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-l-4 border-blue-600 pl-3">
                        1. 정량적 데이터 분석 (Quantitative Analysis)
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        {/* Radar Chart */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[280px]">
                            <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4 text-blue-500" /> 종합 위험도 분석
                            </h3>
                            <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#e5e7eb" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 'bold', fill: '#4b5563' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Operations Bar */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[280px]">
                            <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <BarChart3 className="w-4 h-4 text-orange-500" /> 운영 세부 지표
                            </h3>
                            <div className="w-full h-full pt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={opsData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30}>
                                            <Cell fill="#f59e0b" />
                                            <Cell fill="#fcd34d" />
                                            <Cell fill="#fbbf24" />
                                            <Cell fill="#d97706" />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* QSC Donut */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[280px]">
                            <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-blue-500" /> QSC 품질 기여도
                            </h3>
                            <div className="w-full h-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={qscData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {qscData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={QSC_COLORS[index % QSC_COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                                    <span className="text-2xl font-bold text-blue-600">35%</span>
                                    <span className="text-[10px] text-gray-400 font-medium">영향도</span>
                                </div>
                            </div>
                            <div className="flex gap-3 text-[10px] mt-[-10px] mb-1">
                                {qscData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: QSC_COLORS[i] }}></div>
                                        <span className="text-gray-600">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* POS Donut */}
                        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[280px]">
                            <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2 flex items-center justify-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-purple-500" /> POS 매출/객단가 기여도
                            </h3>
                            <div className="w-full h-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={posData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {posData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={POS_COLORS[index % POS_COLORS.length]} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                                    <span className="text-2xl font-bold text-purple-600">45%</span>
                                    <span className="text-[10px] text-gray-400 font-medium">영향도</span>
                                </div>
                            </div>
                            <div className="flex gap-3 text-[10px] mt-[-10px] mb-1">
                                {posData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: POS_COLORS[i] }}></div>
                                        <span className="text-gray-600">{d.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===================================================================================
                   PART 2: SV Comment Analysis (Risk Diagnosis) - MOVED DOWN
                   =================================================================================== */}
                <div className="mb-10">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-l-4 border-indigo-600 pl-3">
                        2. SV 점검 코멘트 분석 (Risk Diagnosis)
                    </h2>

                    {/* Top Row: Score & Topics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">

                        {/* 2-1. Risk Score Gauge */}
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-1 ${riskLevel.bg.replace('bg-', 'bg-opacity-50 ')}`}></div>
                            <h3 className="text-gray-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <ShieldAlert className="w-4 h-4" />
                                종합 위험도 (Negative Score)
                            </h3>
                            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        className="text-gray-200"
                                        strokeWidth="10"
                                        stroke="currentColor"
                                        fill="transparent"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        className={`${riskLevel.color}`}
                                        strokeWidth="10"
                                        strokeDasharray={2 * Math.PI * 70}
                                        strokeDashoffset={2 * Math.PI * 70 * (1 - riskData.commentNegativeScore / 100)}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${riskLevel.color}`}>{riskData.commentNegativeScore}</span>
                                    <span className="text-xs text-gray-400 font-bold mt-1">/ 100</span>
                                </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${riskLevel.bg} ${riskLevel.color} border ${riskLevel.border}`}>
                                {riskLevel.label}
                            </div>
                        </div>

                        {/* 2-2. Topics & Keywords */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-gray-700 font-bold mb-3 flex items-center gap-2 text-sm">
                                    <Info className="w-4 h-4 text-indigo-500" />
                                    감지된 이슈 카테고리 (Topics)
                                </h3>
                                <div className="flex flex-wrap gap-2 content-start">
                                    {riskData.topics.map((topic, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-bold">
                                            #{topic}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                                <h3 className="text-gray-700 font-bold mb-3 flex items-center gap-2 text-sm">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    주요 위험 키워드 (Risk Keywords)
                                </h3>
                                <div className="flex flex-wrap gap-2 content-start">
                                    {riskData.riskKeywords.map((keyword, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-bold flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2-3. AI Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <BrainCircuit className="w-4 h-4 text-purple-600" />
                            AI 코멘트 분석 요약
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 relative">
                            <p className="text-gray-800 leading-relaxed font-bold text-sm breaking-keep">
                                "{riskData.summary}"
                            </p>
                        </div>
                    </div>
                </div>


                {/* ===================================================================================
                   PART 3: Detailed Insights (Text) - KEPT AT BOTTOM
                   =================================================================================== */}
                <div className="mb-10 break-before-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-l-4 border-gray-900 pl-3">
                        3. 상세 분석 내용 (Detailed Insights)
                    </h2>

                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                        <div className="space-y-4 text-gray-700 text-sm leading-7">
                            <p>
                                <strong className="text-gray-900">1. 매출 및 POS 데이터 분석:</strong><br />
                                최근 4주간의 데이터를 분석한 결과, 주말 매출은 전월 대비 12% 상승하였으나 평일 저녁 매출은 소폭 감소 추세입니다. 특히 재방문율 지표에서 30대 여성 고객층의 이탈이 감지되고 있어, 해당 타겟층을 위한 프로모션이나 메뉴 구성 재검토가 권장됩니다.
                            </p>
                            <p>
                                <strong className="text-gray-900">2. QSC 품질 진단:</strong><br />
                                전반적인 청결도 점수는 우수(92점)하나, 주방 기기 관리 항목에서 반복적인 지적 사항이 발생하고 있습니다. 식기세척기 및 오븐의 정기 점검 주기를 준수하고 있는지 확인이 필요합니다. 서비스 부문에서는 고객 대기 시간 관리가 매우 우수하게 나타났습니다.
                            </p>
                            <p>
                                <strong className="text-gray-900">3. 운영 효율성 및 리스크:</strong><br />
                                인력 배치 효율은 적정 수준을 유지하고 있으나, 식자재 폐기율이 동종 상권 평균 대비 2.5% 높게 나타나고 있습니다. 발주 정확도를 높이기 위한 재고 관리 시스템 활용 교육이 필요할 것으로 판단됩니다.
                            </p>
                            <p className="mt-4 p-4 bg-white border border-gray-200 rounded text-gray-500 text-xs italic">
                                * 본 리포트는 AI 엔진(Core Engine v2.4)이 실시간 데이터를 기반으로 자동 생성한 초안이며, 최종 판단은 담당 슈퍼바이저의 확인이 필요합니다.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer / Disclaimer */}
                <div className="mt-8 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                    <p>Copyright © 2026 Franchise Management System. All rights reserved.</p>
                </div>

            </div>
        </div>
    );
}
