'use client';

import { use, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { Download, BrainCircuit, ArrowLeft } from 'lucide-react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

interface Props {
    params: Promise<{ storeId: string }>;
}

export default function RiskReportPage({ params }: Props) {
    const { storeId } = use(params);
    const router = useRouter();
    const profile = MOCK_RISK_PROFILES[storeId];

    if (!profile) notFound();

    // -- Data Preparation --

    // 1. Radar Chart Data (Feature/Dimensions)
    // We'll normalize the scores for the radar chart
    const radarData = [
        { subject: '종합 위험도', A: profile.totalRiskScore, fullMark: 100 },
        { subject: 'QSC', A: 85, fullMark: 100 }, // Mock value if not in profile
        { subject: '매출 안정성', A: 70, fullMark: 100 },
        { subject: '운영 효율', A: 90, fullMark: 100 },
        { subject: '고객 반응', A: 65, fullMark: 100 },
        { subject: '규정 준수', A: 95, fullMark: 100 },
    ];

    // 2. QSC Contribution (Donut)
    // Mocking sub-factors for QSC
    const qscData = [
        { name: '청결도', value: 40 },
        { name: '서비스', value: 30 },
        { name: '제품품질', value: 30 },
    ];
    const QSC_COLORS = ['#3b82f6', '#93c5fd', '#bfdbfe'];

    // 3. POS Contribution (Donut) -> Wireframe says "POS Contribution"
    const posData = [
        { name: '매출하락', value: 60 },
        { name: '객단가', value: 25 },
        { name: '재방문', value: 15 },
    ];
    const POS_COLORS = ['#8b5cf6', '#c4b5fd', '#ddd6fe'];

    // 4. Ops Contribution (Bar) -> Wireframe "Ops Breakdown Bar"
    const opsData = [
        { name: '발주', value: 80 },
        { name: '인력', value: 45 },
        { name: '교육', value: 30 },
        { name: '시설', value: 60 },
    ];

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Action Bar (No-Print) */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 print:hidden">
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

            {/* A4 Paper Layout */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg my-8 p-[10mm] min-h-[297mm] print:shadow-none print:my-0 print:w-full max-w-none">

                {/* Report Header */}
                <div className="border-b-2 border-gray-900 pb-4 mb-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">위험 진단 리포트</h1>
                            <div className="text-sm font-bold text-gray-600 flex gap-4">
                                <span>점포명: <span className="text-gray-900">{profile.storeName}</span></span>
                                <span>진단일: <span className="text-gray-900">{new Date().toLocaleDateString()}</span></span>
                                <span>REPORT ID: <span className="text-gray-900">R-{storeId}-20260116</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <BrainCircuit className="w-10 h-10 text-purple-600 ml-auto mb-1" />
                            <span className="text-xs font-bold text-purple-600">AI Risk Engine Powered</span>
                        </div>
                    </div>
                </div>

                {/* Charts Section: 2x2 Grid for Better Visibility */}
                <div className="grid grid-cols-2 gap-8 mb-8">

                    {/* 1. Radar Chart (Comprehensive) */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[300px]">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2">
                            위험도 종합 분석 (Risk Dimensions)
                        </h3>
                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fontWeight: 'bold', fill: '#4b5563' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                                    <Tooltip />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Operations Bar (Operational Breakdown) */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[300px]">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2">
                            운영 세부 지표 (Operational Breakdown)
                        </h3>
                        <div className="w-full h-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={opsData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px' }} />
                                    <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={40}>
                                        <Cell fill="#f59e0b" />
                                        <Cell fill="#fcd34d" />
                                        <Cell fill="#fbbf24" />
                                        <Cell fill="#d97706" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. QSC Donut */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[300px]">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2">
                            QSC 품질 기여도
                        </h3>
                        <div className="w-full h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={qscData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
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
                                <span className="text-3xl font-bold text-blue-600">35%</span>
                                <span className="text-xs text-gray-400 font-medium">영향도</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-4 text-xs mt-[-20px] mb-2">
                            {qscData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: QSC_COLORS[i] }}></div>
                                    <span className="text-gray-600">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. POS Donut */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[300px]">
                        <h3 className="text-sm font-extrabold text-gray-800 mb-2 w-full text-center border-b border-gray-100 pb-2">
                            POS 매출/객단가 기여도
                        </h3>
                        <div className="w-full h-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={posData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
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
                                <span className="text-3xl font-bold text-purple-600">45%</span>
                                <span className="text-xs text-gray-400 font-medium">영향도</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="flex gap-4 text-xs mt-[-20px] mb-2">
                            {posData.map((d, i) => (
                                <div key={d.name} className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: POS_COLORS[i] }}></div>
                                    <span className="text-gray-600">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Summary */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
                    <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> AI 요약 인사이트
                    </h3>
                    <p className="text-blue-900 font-medium leading-relaxed">
                        "{profile.anomaly?.summary || '현재 특이점은 발견되지 않았으며, 전반적인 매장 운영 지표가 안정적입니다. 다만 주말 피크타임의 인력 운영 효율을 5% 개선할 여지가 있습니다.'}"
                    </p>
                </div>

                {/* Detailed Analysis */}
                <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">상세 분석 내용</h3>
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
                        <p className="mt-4 p-4 bg-gray-100 rounded text-gray-600 italic">
                            * 본 리포트는 AI 엔진(Core Engine v2.4)이 실시간 데이터를 기반으로 자동 생성한 초안이며, 최종 판단은 담당 슈퍼바이저의 확인이 필요합니다.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
