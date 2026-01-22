'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, BarChart2 } from 'lucide-react';

export default function ActionEffectPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Mock Data
    const actionData = {
        title: '위생 점검 재이행',
        store: '강남점',
        relatedEvent: '이벤트11',
        type: '방문',
        assignee: '김슈퍼',
        metric: '위생점수',
        executionDate: '2026-01-15'
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 효과 분석</h1>
            </div>

            {/* Summary Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">1. 조치 내용 요약</h2>
                </div>
                <div className="border-t border-b border-gray-300">
                    <table className="w-full text-sm text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200 w-32">제목</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.title}</td>
                                <td className="p-3 bg-gray-50 border-r border-gray-200"></td>
                                <td className="p-3"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">대상 점포</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.store}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200 w-32">연관 이벤트</th>
                                <td className="p-3 text-gray-900">{actionData.relatedEvent}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">조치 유형</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.type}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">담당자</th>
                                <td className="p-3 text-gray-900">{actionData.assignee}</td>
                            </tr>
                            <tr>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">목표 지표</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.metric}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">조치 시행일</th>
                                <td className="p-3 text-gray-900">{actionData.executionDate}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Effect Graph Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">2. 조치 효과</h2>
                </div>

                <div className="bg-gray-50 border border-gray-300 rounded-lg p-10 min-h-[400px]">
                    {/* Graph Mockup */}
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <div className="relative w-full max-w-3xl h-64 border-l border-b border-gray-400 flex items-end px-4 gap-8">
                            {/* Background Guidelines */}
                            <div className="absolute inset-0 z-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
                                <div className="border-b border-gray-400 w-full h-0"></div>
                                <div className="border-b border-gray-400 w-full h-0"></div>
                                <div className="border-b border-gray-400 w-full h-0"></div>
                            </div>

                            {/* Mock Lines */}
                            {/* Blue Line (Before) */}
                            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0,80 Q25,75 50,78 T100,70" fill="none" stroke="blue" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>
                            {/* Red Line (After) */}
                            <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <path d="M0,70 Q25,60 50,30 T100,20" fill="none" stroke="red" strokeWidth="3" />
                            </svg>
                        </div>

                        {/* Legend & Guide */}
                        <div className="bg-white p-6 rounded shadow-sm border border-gray-200 text-left max-w-2xl w-full">
                            <div className="flex items-center gap-6 mb-4 justify-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-0.5 bg-blue-600 border-dashed border-b"></div>
                                    <span className="text-sm font-bold text-blue-600">조치 전 (2주)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-1 bg-red-500"></div>
                                    <span className="text-sm font-bold text-red-500">조치 후 (2주) - 개선됨</span>
                                </div>
                            </div>

                            <h4 className="font-bold text-gray-900 mb-2 border-b pb-1">AI 분석 리포트</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                                <li><strong>비교 기간:</strong> 조치 시행일 기준 전/후 2주 데이터 비교</li>
                                <li><strong>분석 결과:</strong> 조치 후 목표 지표({actionData.metric})가 평균 <span className="text-red-600 font-bold">15% 상승</span>했습니다.</li>
                                <li><strong>세부 항목:</strong> QSC 점수 회복세가 뚜렷하며, 특히 위생 카테고리 점수가 대폭 개선되었습니다.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
