'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { EventService } from '@/services/eventService';
import { EventLog } from '@/types'; // 타입 활용

export default function EventDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const [event, setEvent] = useState<EventLog | null>(null);
    const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'SUPERVISOR' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetail = async () => {
            try {
                AuthService.init();
                const user = await AuthService.getCurrentUser();
                if (user) {
                    setRole(user.role);
                }

                const foundEvent = await EventService.getEvent(id);

                if (foundEvent) {
                    // Service에서 이미 매핑된 데이터를 그대로 사용
                    setEvent(foundEvent);
                }
            } catch (error) {
                console.error("Event detail fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEventDetail();
    }, [id]);

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!event) return (
        <div className="p-20 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">이벤트를 찾을 수 없습니다.</h2>
            <p className="text-gray-500 mt-2">요청하신 이벤트 ID ({id})가 존재하지 않거나 삭제되었습니다.</p>
            <button
                onClick={() => router.back()}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-bold"
            >
                뒤로 가기
            </button>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header / Back */}
            <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">이벤트 상세 정보</h1>
            </div>

            {/* 1. Event Core Summary */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center space-y-4">
                <h2 className="text-xl font-bold text-gray-900">이벤트 핵심 요약</h2>

                {/* ID Bar */}
                <div className="flex items-center justify-center gap-3 text-sm text-gray-600 bg-gray-50 py-2 px-4 rounded-full w-fit mx-auto">
                    <span className="font-bold text-gray-900">{event.type}</span>
                    <span>|</span>
                    <span className="font-bold text-gray-900">{event.storeName}</span>
                    <span>|</span>
                    <span className={`font-bold ${event.severity === 'CRITICAL' ? 'text-red-600' : 'text-orange-500'}`}>{event.severity}</span>
                    <span>|</span>
                    {/* [수정] occurredAt 삭제 -> timestamp 사용 */}
                    <span>{(event.timestamp || '').replace('T', ' ').slice(0, 16)}</span>
                    <span>|</span>
                    <span className="font-bold text-blue-600">{event.status}</span>
                </div>

                {/* Summary Sentence */}
                <div className="text-lg font-medium text-gray-800">
                    {/* [수정] summary 삭제 -> message 사용 */}
                    "{event.message}"
                </div>
            </div>


            {/* Footer Buttons */}
            <div className="flex justify-end mt-8">
                {(role === 'MANAGER') && (
                    <button
                        onClick={() => router.push(`/actions/new?eventId=${id}`)}
                        className="px-6 py-3 bg-blue-600 text-white font-bold text-lg rounded hover:bg-blue-700 shadow-sm"
                    >
                        조치 생성
                    </button>
                )}
            </div>
        </div>
    );
}