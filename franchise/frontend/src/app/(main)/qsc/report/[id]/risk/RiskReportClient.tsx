'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { useState, useEffect } from 'react';

// Mock Data Types
interface RiskAnalysisData {
    commentNegativeScore: number; // 0-100
    topics: string[];
    riskKeywords: string[];
    summary: string;
}

// Mock Data Generator (Simulating backend response)
const getMockRiskData = (id: string): RiskAnalysisData => {
    // Return slightly different data based on ID or random for demo
    return {
        commentNegativeScore: 78,
        topics: ['위생', '인력', '시설'],
        riskKeywords: ['악취', '청결불량', '응대지연', '유니폼미착용'],
        summary: '전반적인 매장 위생 상태가 우려되며, 특히 주방 악취와 홀 바닥 청결 문제가 심각합니다. 또한 피크타임 인력 부족으로 인한 응대 지연 및 직원 복장 규정 위반이 관찰되어 즉각적인 개선 조치가 필요합니다.'
    };
};

export default function RiskReportClient({ id }: { id: string }) {
    const router = useRouter();
    const [data, setData] = useState<RiskAnalysisData | null>(null);

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setData(getMockRiskData(id));
        }, 500);
    }, [id]);

    if (!data) {
        return <div className="p-20 text-center">분석 중...</div>;
    }

    // Determine Risk Level
    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: '심각 (Critical)', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
        if (score >= 50) return { label: '주의 (Warning)', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
        return { label: '양호 (Normal)', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    };

    const riskLevel = getRiskLevel(data.commentNegativeScore);

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">AI 위험 진단 리포트</h1>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Risk Score Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
                    <h3 className="text-gray-500 font-bold mb-6 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" />
                        위험도 (Negative Score)
                    </h3>

                    <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                        {/* Simple CSS Circle Progress (Substitute with proper chart lib if available, using CSS/SVG for now) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                className="text-gray-200"
                                strokeWidth="16"
                                stroke="currentColor"
                                fill="transparent"
                            />
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                className={`${riskLevel.color}`}
                                strokeWidth="16"
                                strokeDasharray={2 * Math.PI * 88}
                                strokeDashoffset={2 * Math.PI * 88 * (1 - data.commentNegativeScore / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-5xl font-black ${riskLevel.color}`}>{data.commentNegativeScore}</span>
                            <span className="text-sm text-gray-400 font-bold">/ 100</span>
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${riskLevel.bg} ${riskLevel.color} border ${riskLevel.border}`}>
                        {riskLevel.label}
                    </div>
                </div>

                {/* 2. Topics & Keywords Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
                    <div>
                        <h3 className="text-gray-500 font-bold mb-3 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            감지된 이슈 카테고리 (Topics)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.topics.map((topic, idx) => (
                                <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-bold">
                                    #{topic}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-gray-500 font-bold mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            주요 위험 키워드 (Keywords)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {data.riskKeywords.map((keyword, idx) => (
                                <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {keyword}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Summary Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    AI 종합 요약 (Summary)
                </h3>
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <p className="text-gray-800 leading-relaxed font-medium text-lg breaking-keep">
                        "{data.summary}"
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">안내</p>
                    이 리포트는 담당 SV가 작성한 점검 코멘트를 기반으로 AI가 분석한 결과입니다. 실제 현장 상황과는 차이가 있을 수 있으므로 참고용으로 활용하시기 바랍니다.
                </div>
            </div>

        </div>
    );
}
