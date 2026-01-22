'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

// Mock Data (Should be fetched via API in real app)
const MOCK_ACTION_DETAIL = {
    id: 1,
    title: '위생 점검 재이행',
    store: '강남점',
    relatedEvent: '이벤트11',
    type: '방문',
    assignee: '김슈퍼',
    metric: '위생점수',
    deadline: '2026-01-15',
    priority: 'HIGH',
    description: '지난 QSC 점검에서 식자재 보관 상태가 미흡하여 재점검이 필요합니다. 방문하여 냉장/냉동고 온도를 확인하고 식자재 라벨링 상태를 전수 조사해주시기 바랍니다.'
};

export default function ActionEditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [formData, setFormData] = useState(MOCK_ACTION_DETAIL);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 수정</h1>
            </div>

            {/* Edit Form Table */}
            <div className="bg-white border border-gray-400 rounded-sm">
                <div className="divide-y divide-gray-200">
                    {/* Read Only Fields */}
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">대상 점포</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.store} (자동 등록)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.relatedEvent} (자동 등록)</div>
                    </div>

                    {/* Editable Fields */}
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">조치 유형</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                            >
                                <option value="교육">교육</option>
                                <option value="방문">방문</option>
                                <option value="재점검">재점검</option>
                                <option value="프로모션">프로모션</option>
                                <option value="시설 개선">시설 개선</option>
                                <option value="인력 보강">인력 보강</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">담당자</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.assignee} (자동 등록)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">목표 지표</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.metric}
                                onChange={(e) => handleChange('metric', e.target.value)}
                            >
                                <option value="QSC">QSC</option>
                                <option value="매출">매출</option>
                                <option value="위생점수">위생점수</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">기한</div>
                        <div className="flex-1 p-2">
                            <input
                                type="date"
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.deadline}
                                onChange={(e) => handleChange('deadline', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">우선순위</div>
                        <div className="flex-1 p-2">
                            <select
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.priority}
                                onChange={(e) => handleChange('priority', e.target.value)}
                            >
                                <option value="CRITICAL">CRITICAL (즉시 조치)</option>
                                <option value="HIGH">HIGH (빠른 대응)</option>
                                <option value="MEDIUM">MEDIUM (관리 필요)</option>
                                <option value="LOW">LOW (관찰/개선)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title & Description */}
            <div className="border border-gray-400 rounded-sm overflow-hidden">
                <div className="flex border-b border-gray-200">
                    <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">제목</div>
                    <div className="flex-1 p-2">
                        <input
                            type="text"
                            className="w-full border border-gray-300 p-2 rounded"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                        />
                    </div>
                </div>
                <div className="p-4 bg-white">
                    <h3 className="text-sm font-bold text-gray-500 mb-2">조치 내용</h3>
                    <textarea
                        className="w-full h-40 p-4 border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="조치 내용을 상세히 입력하세요."
                    />
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={() => {
                        alert('저장되었습니다.');
                        router.push(`/actions/${params.id}`);
                    }}
                    className="px-8 py-3 border border-gray-400 bg-white text-gray-900 font-bold text-lg rounded hover:bg-gray-50 shadow-sm"
                >
                    저장
                </button>
            </div>
        </div>
    );
}
