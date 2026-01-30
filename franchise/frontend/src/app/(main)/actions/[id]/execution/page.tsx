'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { ActionService } from '@/services/actionService';
import { StoreService } from '@/services/storeService';
import { EventService } from '@/services/eventService';

export default function ActionExecutionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const [formData, setFormData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [executionDate, setExecutionDate] = useState(new Date().toISOString().split('T')[0]);
    const [resultContent, setResultContent] = useState('');
    const [selectedImages, setSelectedImages] = useState<string[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const newUrls = newFiles.map(file => URL.createObjectURL(file));
            setSelectedImages(prev => [...prev, ...newUrls]);
        }
    };

    const handleRemoveImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // Fetch Form and Action Detail in parallel
                const [formResponse, actionDetail] = await Promise.all([
                    ActionService.getResultForm(id).catch(() => null),
                    ActionService.getAction(id).catch(() => undefined)
                ]);

                // Base data is formResponse if it's a valid object, otherwise empty object
                const mergedData = (formResponse && typeof formResponse === 'object') ? formResponse : {};

                if (actionDetail) {
                    // Populate missing fields from actionDetail
                    if (!mergedData.storeName || mergedData.storeName === '-') mergedData.storeName = actionDetail.storeName;
                    if (!mergedData.problemMessage) mergedData.problemMessage = actionDetail.description;
                    if (!mergedData.actionTitle) mergedData.actionTitle = actionDetail.title;
                    if (!mergedData.actionType) mergedData.actionType = actionDetail.type;

                    // Add manager info if missing
                    mergedData.assigneeName = actionDetail.assigneeName;

                    // Fetch fallback data in parallel
                    const fallbackPromises = [];

                    // 1. Fallback for storeName using StoreService
                    if ((!mergedData.storeName || mergedData.storeName === '-') && actionDetail.storeId) {
                        fallbackPromises.push(
                            StoreService.getStore(actionDetail.storeId)
                                .then(store => {
                                    if (store) mergedData.storeName = store.name;
                                })
                                .catch(e => console.error("Failed to fetch store fallback", e))
                        );
                    }

                    // 2. Fallback for assigneeName using Actions List lookup
                    if ((!mergedData.assigneeName || mergedData.assigneeName === '-') && actionDetail.assignee) {
                        fallbackPromises.push(
                            ActionService.getActions()
                                .then(list => {
                                    const match = list.find(a => String(a.id) === String(id));
                                    if (match && match.assigneeName) {
                                        mergedData.assigneeName = match.assigneeName;
                                    }
                                })
                                .catch(e => console.error("Failed to fetch assignee fallback", e))
                        );
                    }

                    await Promise.all(fallbackPromises);
                }

                if (Object.keys(mergedData).length > 0) {
                    setFormData(mergedData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    const handleSubmit = async () => {
        if (!resultContent.trim()) {
            alert('조치 결과를 입력해주세요.');
            return;
        }

        const success = await ActionService.saveExecution(id, {
            resultContent,
            completedAt: executionDate + 'T' + new Date().toISOString().split('T')[1]
        });

        if (success) {
            alert('작성 완료되었습니다. 조치가 CLOSED 상태로 변경되었습니다.');
            router.push(`/actions/${id}`);
        } else {
            alert('작성 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 font-bold">양식을 불러오는 중...</div>;
    if (!formData) return <div className="p-12 text-center text-red-500 font-bold">양식 데이터를 찾을 수 없습니다.</div>;

    const actionData = {
        id: id,
        store: formData.storeName || '-',
        problemCause: formData.problemMessage || '-',
        actionName: formData.actionTitle || '-',
        actionType: formData.actionType || '-',
        manager: formData.assigneeName || '-',
    };

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
                                <span className="font-bold text-gray-700 w-24 flex-shrink-0">담당자 :</span>
                                <span className="text-gray-900">{actionData.manager}</span>
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
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        id="file-upload"
                        onChange={handleFileChange}
                    />
                    <label
                        htmlFor="file-upload"
                        className="border-2 border-dashed border-gray-300 rounded-lg flex-1 min-h-[400px] flex flex-col items-center justify-start p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                        <Camera className="w-12 h-12 text-gray-400 mb-2 mt-10" />
                        <span className="text-gray-500 font-medium mb-4">사진을 드래그하거나 클릭하여 업로드</span>

                        <div className="grid grid-cols-2 gap-2 w-full">
                            {selectedImages.map((url, idx) => (
                                <div key={idx} className="relative group aspect-square bg-gray-200 rounded overflow-hidden">
                                    <img src={url} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent triggering file input
                                            handleRemoveImage(idx);
                                        }}
                                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-opacity opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </label>
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
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
                >
                    작성 완료
                </button>
            </div>
        </div>
    );
}
