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

            {/* 2. Root Cause Metrics Area (Conditional) */}
            {event.relatedData && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                        발생 원인 지표 분석
                    </h3>

                    {(event.type === 'QSC' || event.type.startsWith('QSC')) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                                <span className="text-sm font-bold text-gray-500 mb-2">
                                    {event.relatedData.metricLabel || '관련 지표'}
                                </span>
                                <div>
                                    <span className="text-3xl font-bold text-red-600">
                                        {event.relatedData.value}
                                    </span>
                                    {event.relatedData.threshold && (
                                        <span className="ml-2 text-sm text-gray-500">
                                            (기준: {event.relatedData.threshold})
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-5 flex items-center justify-center text-gray-400 text-sm">
                                상세 점검 리포트는 추후 연동 예정입니다.
                            </div>
                        </div>
                    )}

                    {(event.type === 'POS' || event.type.startsWith('POS')) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                    <DollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="text-gray-500 font-bold text-sm mb-1">
                                    {event.relatedData.metricLabel || '매출 지표'}
                                </h4>
                                <span className="text-2xl font-bold text-gray-900">
                                    {Number(event.relatedData.value).toLocaleString()}
                                </span>
                            </div>
                             <div className="border border-gray-200 rounded-lg p-6 flex items-center justify-center text-gray-400 text-sm">
                                상세 매출 분석 데이터는 추후 연동 예정입니다.
                            </div>
                        </div>
                    )}

                    {!event.type.startsWith('QSC') && !event.type.startsWith('POS') && (
                         <div className="border border-gray-200 rounded-lg p-5">
                            <span className="text-sm font-bold text-gray-500 block mb-1">
                                {event.relatedData.metricLabel || '참고 데이터'}
                            </span>
                            <span className="text-xl font-bold text-gray-900">
                                {event.relatedData.value}
                            </span>
                         </div>
                    )}
                </div>
            )}
            
            {!event.relatedData && (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 text-sm">
                    <Info className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    이 이벤트와 관련된 추가 지표 데이터가 없습니다.
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end mt-8">
                {(role === 'MANAGER' || role === 'ADMIN') && (
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