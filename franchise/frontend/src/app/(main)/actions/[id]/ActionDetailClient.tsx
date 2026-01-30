'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ActionService } from '@/services/actionService';
import { StoreService } from '@/services/storeService';
import { EventService } from '@/services/eventService';
import { ActionItem } from '@/types';
import { AuthService } from '@/services/authService';

interface ActionDetailClientProps {
    id: string;
}

export default function ActionDetailClient({ id }: ActionDetailClientProps) {
    const router = useRouter();
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);
    const [action, setAction] = useState<ActionItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const [currentUser, actionData] = await Promise.all([
                    AuthService.getCurrentUser(),
                    ActionService.getAction(id)
                ]);

                if (currentUser) setRole(currentUser.role);
                if (actionData) {
                    // Fetch supplementary data in parallel if needed
                    const promises = [];

                    // 1. Fetch Store Name if missing
                    if ((!actionData.storeName || actionData.storeName === '-') && actionData.storeId) {
                        promises.push(
                            StoreService.getStore(actionData.storeId)
                                .then(store => {
                                    if (store) actionData.storeName = store.name;
                                })
                                .catch(() => { })
                        );
                    }

                    // 2. Fetch Event Name if linkedEventId exists
                    if (actionData.linkedEventId) {
                        promises.push(
                            EventService.getEvent(actionData.linkedEventId)
                                .then(event => {
                                    if (event) (actionData as any).linkedEventName = event.title; // Add custom field linkedEventName
                                })
                                .catch(() => { })
                        );
                    }

                    // 3. Fetch Assignee Name if missing
                    if ((!actionData.assigneeName || actionData.assigneeName === '-') && actionData.assignee) {
                        promises.push(
                            ActionService.getActions()
                                .then(list => {
                                    const match = list.find(a => String(a.id) === String(id));
                                    if (match && match.assigneeName) {
                                        actionData.assigneeName = match.assigneeName;
                                    }
                                })
                                .catch(() => { })
                        );
                    }

                    await Promise.all(promises);
                    setAction({ ...actionData }); // Create new object reference
                } else {
                    // Handle 404 or missing action
                }
            } catch (error) {
                console.error("Failed to load action detail", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id]);

    if (loading) return <div className="p-12 text-center text-gray-500 font-bold">조치 정보를 불러오는 중...</div>;
    if (!action) return <div className="p-12 text-center text-red-500 font-bold">조치 정보를 찾을 수 없습니다.</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 상세보기</h1>
            </div>

            {/* Info Table */}
            <div className="bg-white border border-gray-400 rounded-sm">
                <div className="divide-y divide-gray-200">
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">제목</div>
                        <div className="flex-1 p-4 text-gray-900 font-medium">{action.title}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">대상 점포</div>
                        <div className="flex-1 p-4 text-gray-900">{action.storeName || action.storeId || '-'}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-900">{((action as any).linkedEventName) ? `${(action as any).linkedEventName} (#${action.linkedEventId})` : (action.linkedEventId || '-')}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">조치 유형</div>
                        <div className="flex-1 p-4 text-gray-900">{action.type}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">담당자</div>
                        <div className="flex-1 p-4 text-gray-900">{action.assigneeName || action.assignee || '-'}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">기한</div>
                        <div className="flex-1 p-4 text-gray-900">{action.dueDate || '-'}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">우선순위</div>
                        <div className="flex-1 p-4 text-gray-900">{action.priority}</div>
                    </div>
                </div>
            </div>

            {/* Description Area */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">조치 내용</h3>
                <div className="w-full bg-gray-100 p-8 rounded border border-gray-300 min-h-[150px] flex items-center justify-center text-gray-800 font-medium whitespace-pre-line text-center">
                    {action.description}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
                {/* SV: Write Execution Result & View Effect */}
                {role === 'SUPERVISOR' && (
                    <>
                        {action.status !== 'CLOSED' && (
                            <button
                                onClick={() => router.push(`/actions/${id}/execution`)}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-sm"
                            >
                                조치 수행 결과 작성
                            </button>
                        )}
                        {action.status === 'CLOSED' && (
                            <button
                                onClick={() => router.push(`/actions/${id}/effect`)}
                                className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm"
                            >
                                효과보기
                            </button>
                        )}
                    </>
                )}

                {/* Admin: View Effect Only */}
                {role === 'ADMIN' && (
                    <button
                        onClick={() => router.push(`/actions/${id}/effect`)}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm"
                    >
                        효과보기
                    </button>
                )}

                {/* Team Leader: Edit Action */}
                {role === 'MANAGER' && (
                    <button
                        onClick={() => router.push(`/actions/${id}/edit`)}
                        className="px-6 py-2 border border-blue-600 bg-white text-blue-600 font-bold rounded hover:bg-blue-50"
                    >
                        수정
                    </button>
                )}

                <button
                    onClick={() => router.push('/actions')}
                    className="px-6 py-2 border border-gray-400 bg-white text-gray-800 font-bold rounded hover:bg-gray-50"
                >
                    목록
                </button>
            </div>
        </div >
    );
}
