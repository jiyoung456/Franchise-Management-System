'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, CheckCircle2, AlertTriangle, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { ActionService } from '@/services/actionService';
import { StoreService } from '@/services/storeService';
import { EventService } from '@/services/eventService';
import { ActionItem, Store } from '@/types';

export default function ActionsListPage() {
    const router = useRouter();
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [stores, setStores] = useState<Store[]>([]);

    useEffect(() => {
        AuthService.init();
        const user = AuthService.getCurrentUser();
        if (user) setRole(user.role);

        setActions(ActionService.getActions());
        setStores(StoreService.getStores());
    }, []);

    const getStoreName = (storeId: string) => {
        return stores.find(s => s.id === storeId)?.name || 'Unknown Store';
    };

    const getRelatedEventInfo = (action: ActionItem) => {
        if (action.linkedEventId) {
            // Optimize: In a real app we might fetch this. For now just show ID or lookup if cheap.
            // Let's do a quick lookup if we want perfection, but 'Event' + ID is okay for now.
            // Update: Let's actually fetch it since it's local storage.
            const evt = EventService.getEvent(action.linkedEventId);
            return evt ? `${evt.type} (${evt.severity})` : 'Linked Event';
        }
        return '-';
    };

    // Stats
    const openCount = actions.filter(a => a.status === 'OPEN').length;
    const overdueCount = actions.filter(a => a.status === 'OVERDUE').length;
    const unfulfilledAction = actions.filter(a => a.status === 'OVERDUE').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];


    return (
        <div className="space-y-8 pb-20 mx-auto w-full">
            {/* Header Title */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">조치 관리</h1>
                <p className="text-sm text-gray-500 mt-1">점포별 개선 조치 현황과 이행 여부를 추적 관리합니다.</p>
            </div>

            {/* Dashboard Widgets (Admin Only) */}
            {role === 'ADMIN' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. OPEN Actions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <h3 className="text-gray-500 font-bold mb-2">OPEN 조치 수</h3>
                        <p className="text-5xl font-extrabold text-blue-600">{openCount}</p>
                    </div>

                    {/* 2. OVERDUE Actions */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-40">
                        <h3 className="text-gray-500 font-bold mb-2">OVERDUE 조치 수</h3>
                        <p className="text-5xl font-extrabold text-red-600">{overdueCount}</p>
                    </div>

                    {/* 3. Latest Unfulfilled Action */}
                    <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:border-red-400 transition-colors">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <AlertTriangle className="w-24 h-24 text-red-600" />
                        </div>

                        {unfulfilledAction ? (
                            <>
                                <div>
                                    <h3 className="text-red-600 font-bold text-sm mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        가장 최근 미이행 조치
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900 line-clamp-1">{unfulfilledAction.title}</p>
                                    <p className="text-sm text-gray-600 font-medium">{getStoreName(unfulfilledAction.storeId)}</p>
                                </div>
                                <div className="mt-2 text-sm text-gray-500 flex flex-col gap-1">
                                    <span className="font-bold text-red-500">기한: {unfulfilledAction.dueDate}</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 font-bold">
                                미이행 조치 없음
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Action List Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    조치 목록
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Total {actions.length}
                    </span>
                </h2>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    {actions.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">등록된 조치가 없습니다.</div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
                                <tr>
                                    <th className="px-6 py-3 w-1/4">조치 제목</th>
                                    <th className="px-6 py-3">점포명</th>
                                    <th className="px-6 py-3">우선순위</th>
                                    <th className="px-6 py-3">상태</th>
                                    <th className="px-6 py-3">기한</th>
                                    <th className="px-6 py-3">담당자</th>
                                    <th className="px-6 py-3 text-right">연관 이벤트</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {actions.map((action) => (
                                    <tr key={action.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/actions/${action.id}`)}>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {action.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 font-medium">{getStoreName(action.storeId)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${action.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                                                action.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    action.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                        'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                {action.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-bold flex items-center gap-1.5 ${action.status === 'COMPLETED' ? 'text-green-600' :
                                                action.status === 'OPEN' ? 'text-blue-600' : 'text-gray-500'
                                                }`}>
                                                {action.status === 'COMPLETED' ? <CheckCircle2 className="w-3 h-3" /> :
                                                    action.status === 'OPEN' ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {action.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {action.dueDate}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <User className="w-3 h-3 text-gray-400" />
                                                </div>
                                                {action.assignee}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {action.linkedEventId && (
                                                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                    {getRelatedEventInfo(action)}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
