'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, } from 'lucide-react';
import { useState } from 'react';

export default function ActionExecutionPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Mock Data - usually fetched
    const actionData = {
        id: params.id,
        store: '강남점',
        problemCause: '식자재 보관 미흡 (이벤트 #11)',
        actionName: '위생 점검 재이행',
        actionType: '방문',
    };

    const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);
    const [resultContent, setResultContent] = useState('');

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 수행 결과 작성</h1>
            </div>

            <div className="flex gap-6">
                {/* Left Column: Form */}
                <div className="flex-1 space-y-6">
                    {/* Date & Store Row */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">수행 일자</label>
                            <input
                                type="date"
                                value={executionDate}
                                onChange={(e) => setExecutionDate(e.target.value)}
                                className="w-full border border-gray-300 p-2 rounded bg-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-700 mb-1">점포명</label>
                            <input
                                type="text"
                                value={actionData.store}
                                readOnly
                                className="w-full border border-gray-300 p-2 rounded bg-gray-100 text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="border border-gray-400 rounded-sm p-4 space-y-4 bg-white">
                        <h3 className="font-bold text-gray-900 border-b border-gray-200 pb-2">수행 내용 요약</h3>

                        <div className="space-y-2">
                            <div className="border border-gray-300 rounded p-3 flex items-center bg-gray-50">
                                <span className="font-bold text-gray-700 w-24 flex-shrink-0">문제원인 :</span>
                                <span className="text-gray-900">{actionData.problemCause}</span>
                            </div>
                            <div className="border border-gray-300 rounded p-3 flex items-center bg-gray-50">
                                <span className="font-bold text-gray-700 w-24 flex-shrink-0">수행 조치 :</span>
                                <span className="text-gray-900">{actionData.actionName}</span>
                            </div>
                            <div className="border border-gray-300 rounded p-3 flex items-center bg-gray-50">
                                <span className="font-bold text-gray-700 w-24 flex-shrink-0">조치 유형 :</span>
                                <span className="text-gray-900">{actionData.actionType}</span>
                            </div>
                        </div>

                        <div className="border border-gray-300 rounded p-3 bg-white">
                            <span className="font-bold text-gray-700 block mb-2">조치 결과 :</span>
                            <textarea
                                value={resultContent}
                                onChange={(e) => setResultContent(e.target.value)}
                                className="w-full h-32 p-2 border border-gray-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="조치 결과를 상세히 입력해주세요. (예: 양배추 관리가 미흡했는데, 조치 완료 후 상태 양호)"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Photo Attachment */}
                <div className="w-1/3 flex flex-col gap-2">
                    <label className="block text-sm font-bold text-gray-700">사진 첨부</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg flex-1 min-h-[400px] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                        <Camera className="w-12 h-12 text-gray-400 mb-2" />
                        <span className="text-gray-500 font-medium">사진을 드래그하거나 클릭하여 업로드</span>
                        <div className="mt-4 grid grid-cols-2 gap-2 w-full px-4">
                            {/* Mock uploaded images placeholder */}
                            <div className="bg-gray-200 h-24 rounded flex items-center justify-center text-xs text-gray-500">사진 1</div>
                            <div className="bg-gray-200 h-24 rounded flex items-center justify-center text-xs text-gray-500">사진 2</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                    onClick={() => alert('임시 저장되었습니다.')}
                    className="px-6 py-2 border border-gray-400 bg-white text-gray-700 font-bold rounded hover:bg-gray-50"
                >
                    임시 저장
                </button>
                <button
                    onClick={() => {
                        alert('작성 완료되었습니다. 팀장이 확인 후 효과 분석을 진행합니다.');
                        router.push(`/actions/${params.id}`);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                >
                    작성 완료
                </button>
            </div>
        </div>
    );
}
