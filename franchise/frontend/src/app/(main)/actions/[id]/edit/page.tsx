'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ActionService } from '@/services/actionService';
import { ActionItem } from '@/types';
import { AuthService } from '@/services/authService';

export default function ActionEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [formData, setFormData] = useState<ActionItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await ActionService.getAction(id);
                if (data) {
                    setFormData(data);
                }
            } catch (error) {
                console.error("Failed to fetch action for edit", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: value
            } as ActionItem;
        });
    };

    const handleSave = async () => {
        if (!formData) return;

        const success = await ActionService.updateAction(id, {
            title: formData.title,
            description: formData.description,
            actionType: formData.type,
            priority: formData.priority,
            dueDate: formData.dueDate,
            assignedToUserId: Number(formData.assignee),
            status: formData.status
        });

        if (success) {
            alert('저장되었습니다.');
            router.push(`/actions/${id}`);
        } else {
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 font-bold">정보를 불러오는 중...</div>;
    if (!formData) return <div className="p-12 text-center text-red-500 font-bold">수정할 정보를 찾을 수 없습니다.</div>;

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
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.storeName || formData.storeId} (자동 등록)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.linkedEventId || '-'} (자동 등록)</div>
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
                                <option value="TRAINING">교육 (TRAINING)</option>
                                <option value="VISIT">방문 (VISIT)</option>
                                <option value="PROMOTION">프로모션 (PROMOTION)</option>
                                <option value="FACILITY">시설 개선 (FACILITY)</option>
                                <option value="PERSONNEL">인력 보강 (PERSONNEL)</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">담당자</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.assigneeName || formData.assignee} (자동 등록)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">기한</div>
                        <div className="flex-1 p-2">
                            <input
                                type="date"
                                className="w-full border border-gray-300 p-2 rounded"
                                value={formData.dueDate}
                                onChange={(e) => handleChange('dueDate', e.target.value)}
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
                    onClick={handleSave}
                    className="px-8 py-3 border border-gray-400 bg-white text-gray-900 font-bold text-lg rounded hover:bg-gray-50 shadow-sm"
                >
                    저장
                </button>
            </div>
        </div>
    );
}
