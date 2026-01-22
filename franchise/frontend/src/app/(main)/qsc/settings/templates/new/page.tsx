'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';

export default function NewTemplatePage() {
    const router = useRouter();

    // Mock Categories match the requirement (Q, S, C, Safety - 10pts)
    const categories = [
        { id: 'quality', title: 'Quality(품질)', totalScore: 30 },
        { id: 'service', title: 'Service(서비스)', totalScore: 30 },
        { id: 'cleanliness', title: 'Cleanliness(청결)', totalScore: 30 },
        { id: 'safety', title: '안전', totalScore: 10 },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-gray-900 text-center w-full">헤더</h1>
                    <span className="text-sm text-gray-500 mt-2">새 템플릿 생성</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 font-medium"
                    >
                        저장
                    </button>
                </div>
            </div>

            <div className="space-y-6">

                {/* Basic Info Box */}
                <div className="border border-gray-400 p-6 rounded-sm bg-white">
                    <div className="text-gray-900 font-medium text-lg mb-4">
                        템플릿 명, 초기 버전명, 점검 유형(정기/특별/재점검), 적용 범위(전체/지역/점포)
                    </div>
                    {/* Mock Inputs simply to represent the requirement */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="템플릿 명 입력" className="border border-gray-300 p-2 rounded" />
                        <input type="text" placeholder="초기 버전 (예: 1.0)" className="border border-gray-300 p-2 rounded" />
                        <select className="border border-gray-300 p-2 rounded">
                            <option>정기 점검</option>
                            <option>특별 점검</option>
                            <option>재점검</option>
                        </select>
                        <select className="border border-gray-300 p-2 rounded">
                            <option>전체 매장</option>
                            <option>서울/경기</option>
                            <option>특정 매장 선택</option>
                        </select>
                    </div>
                </div>

                {/* Category Sections */}
                {categories.map((cat) => (
                    <div key={cat.id} className="border border-gray-400 p-6 rounded-sm bg-white flex items-center justify-between">
                        <div className="font-bold text-lg text-gray-800">
                            {cat.title} - 총 배점 : {cat.totalScore}점
                        </div>
                        <button className="border border-gray-400 px-6 py-3 rounded bg-white hover:bg-gray-50 flex items-center gap-2 font-medium">
                            <Plus className="w-4 h-4" />
                            항목 추가
                        </button>
                    </div>
                ))}

            </div>

            {/* Modal Trigger/Explanation (Hidden or explicit) */}
            <div className="text-sm text-gray-500 mt-8 p-4 bg-gray-50 rounded border border-gray-200">
                * 항목 추가 클릭 시 : 항목명, 입력 유형 (점수 / 서술), 배점, 필수 여부, 사진 필수(공간 확보), 합격 기준, 점검 가이드 문구 입력 팝업 노출 (구현 예정)
            </div>

        </div>
    );
}
