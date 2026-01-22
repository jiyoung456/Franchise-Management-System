'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';

import { StorageService } from '@/lib/storage';
import { EventLog } from '@/types';

// ... (other imports)

function ActionNewForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const eventId = searchParams.get('eventId');
    const [event, setEvent] = useState<EventLog | null>(null);

    const [formData, setFormData] = useState({
        store: '',
        relatedEvent: '',
        type: '방문',
        assignee: '김슈퍼 (자동)',
        metric: 'QSC',
        deadline: '',
        priority: 'HIGH',
        title: '',
        description: ''
    });

    useEffect(() => {
        StorageService.init();
        if (eventId) {
            const found = StorageService.getEvent(eventId);
            if (found) {
                setEvent(found);
                setFormData(prev => ({
                    ...prev,
                    store: found.storeName,
                    relatedEvent: `이벤트 #${found.id} (${found.type})`,
                    priority: found.severity === 'CRITICAL' ? 'CRITICAL' : 'HIGH'
                }));
            }
        }
    }, [eventId]);

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
                <h1 className="text-2xl font-bold text-gray-900">조치 등록</h1>
            </div>

            {/* Form Table */}
            <div className="bg-white border border-gray-400 rounded-sm">
                <div className="divide-y divide-gray-200">
                    {/* Read Only Fields */}
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">대상 점포</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.store || '-'} (이벤트 연동)</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.relatedEvent || '-'} (이벤트 연동)</div>
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
                        <div className="flex-1 p-4 text-gray-500 bg-gray-50">{formData.assignee}</div>
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
                            placeholder="조치 제목을 입력하세요"
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
                        // 1. Create Action Object
                        const newAction: any = {
                            id: `act_${Date.now()}`,
                            storeId: event ? event.storeId : 'unknown', // Fallback
                            title: formData.title,
                            type: formData.type,
                            status: 'OPEN',
                            priority: formData.priority,
                            assignee: formData.assignee,
                            dueDate: formData.deadline,
                            description: formData.description,
                            linkedEventId: event ? event.id : undefined
                        };

                        // 2. Save Action
                        StorageService.saveAction(newAction);

                        // 3. Update Event Status if linked
                        if (event) {
                            const updatedEvent = { ...event, status: 'ACKNOWLEDGED' as any }; // Change status
                            StorageService.saveEvent(updatedEvent);
                        }

                        alert('조치가 등록되었습니다. (이벤트 상태가 "처리중"으로 변경되었습니다.)');
                        router.push(`/events`); // Back to Events list
                    }}
                    className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded hover:bg-blue-700 shadow-sm"
                >
                    등록
                </button>
            </div>
        </div>
    );
}

export default function ActionNewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActionNewForm />
        </Suspense>
    );
}
