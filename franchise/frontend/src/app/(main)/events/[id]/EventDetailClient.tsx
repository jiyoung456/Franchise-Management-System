'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, TrendingDown, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AuthService } from '@/services/authService';
import { EventService } from '@/services/eventService';

// ... (MOCK_EVENT_DETAILS remains same) - Assuming it was just a comment or unused based on previous view_file. 
// Actually, I should probably copy the logic for detailedEvent creation if it was inline.
// Looking at previous view_file, the detailedEvent was created inside useEffect logic or using MOCK_EVENT_DETAILS constant if it existed?
// In the previous view_file (Step 10 and Step 42), there was "// ... (MOCK_EVENT_DETAILS remains same)" which suggests there might have been a constant I missed or it was just a comment from the user/model previously?
// Ah, looking at Step 10 & 36 source code content... I don't see MOCK_EVENT_DETAILS defined *in the file*. It says `// ... (MOCK_EVENT_DETAILS remains same)` on line 10.
// Wait, if it wasn't defined in the file, then that comment was potentially hiding code or I should just assume the file content provided in Step 10/36 *was* the full file and that comment was there literally?
// Step 36 output shows:
// 10: // ... (MOCK_EVENT_DETAILS remains same)
// Use the logic that was inside useEffect.

export default function EventDetailClient({ id }: { id: string }) {
    const router = useRouter();
    const [event, setEvent] = useState<any>(null); // Using any temporarily for mock data transition
    const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'SUPERVISOR' | null>(null);

    useEffect(() => {
        AuthService.init();
        const user = AuthService.getCurrentUser();
        if (user) {
            setRole(user.role);
        }

        const foundEvent = EventService.getEvent(id);
        if (foundEvent) {
            // Merge with extended details if needed, for now just use data
            // In real app, we'd fetch enhanced data. For now, we reuse MOCK_EVENT_DETAILS logic essentially by spreading or just using what we have.
            // Since EventLog is simpler than the Detail view, we might need to mock the "Metrics" part if it's missing in EventLog.
            // Let's create a hybrid object for display

            const detailedEvent = {
                ...foundEvent,
                // Add mock metrics if missing (Simulating backend detail fetch)
                summary: foundEvent.message,
                metrics: foundEvent.relatedData ? {
                    recentScore: foundEvent.relatedData.value,
                    grade: foundEvent.relatedData.metricLabel === 'Grade' ? foundEvent.relatedData.value : 'B',
                    scoreChange: -12,
                    weakCategory: '위생(Cleanliness)',
                    weakScore: 65,
                    // POS defaults
                    recentSales: 0,
                    salesChange: 0,
                    dropCategory: '-',
                    dropRate: '-'
                } : {
                    // Empty metrics if no related data
                    recentScore: 0, grade: '-', scoreChange: 0, weakCategory: '-', weakScore: 0,
                    recentSales: 0, salesChange: 0, dropCategory: '-', dropRate: '-'
                },
                relatedInspection: {
                    date: '2026-01-14',
                    type: '정기 점검',
                    totalScore: 68,
                    grade: 'C',
                    majorDefects: ['주방 바닥 청결 불량', '식자재 보관 온도 미준수']
                }
            };
            setEvent(detailedEvent);
        }
    }, [id]);

    if (!event) return <div className="p-10 text-center">Loading...</div>;

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
                    <span>{event.time}</span>
                    <span>|</span>
                    <span className="font-bold text-blue-600">{event.status}</span>
                </div>

                {/* Summary Sentence */}
                <div className="text-lg font-medium text-gray-800">
                    "{event.summary}"
                </div>
            </div>

            {/* 2. Root Cause Metrics Area (Conditional) */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2 text-red-500" />
                    발생 원인 지표 분석 ({event.category})
                </h3>

                {/* Case A: QSC Metrics */}
                {(event.type === 'QSC' || event.category === 'QSC') && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <span className="text-sm font-bold text-gray-500 mb-2">최근 점검 점수</span>
                            <div>
                                <span className="text-3xl font-bold text-red-600">{event.metrics.recentScore}점</span>
                                <span className="ml-2 text-sm font-bold text-gray-500">({event.metrics.grade}등급)</span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <span className="text-sm font-bold text-gray-500 mb-2">직전 대비 변화</span>
                            <div>
                                <span className="text-3xl font-bold text-red-600">{event.metrics.scoreChange}점</span>
                                <span className="text-xs text-gray-400 block mt-1">지난 점검 대비 하락</span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <span className="text-sm font-bold text-gray-500 mb-2">취약 카테고리</span>
                            <div>
                                <span className="text-lg font-bold text-gray-800 break-keep">{event.metrics.weakCategory}</span>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                                <span className="text-xs text-red-500 mt-1 block">{event.metrics.weakScore}점 (매우 낮음)</span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-5 flex flex-col justify-between hover:border-blue-300 transition-colors">
                            <span className="text-sm font-bold text-gray-500 mb-2">연관 점검 정보</span>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><span className="font-bold">일시:</span> {event.relatedInspection.date}</p>
                                <p><span className="font-bold">유형:</span> {event.relatedInspection.type}</p>
                                <p className="text-red-600 font-bold mt-2">주요 감점:</p>
                                <ul className="list-disc list-inside text-xs text-gray-500">
                                    {event.relatedInspection.majorDefects.map((d: string, i: number) => (
                                        <li key={i}>{d}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Case B: POS Metrics */}
                {(event.type === 'POS' || event.category === 'POS') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                            <h4 className="text-gray-500 font-bold text-sm mb-1">최근 주간 매출</h4>
                            <span className="text-2xl font-bold text-gray-900">
                                {event.metrics.recentSales.toLocaleString()}원
                            </span>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                                <TrendingDown className="w-6 h-6 text-red-600" />
                            </div>
                            <h4 className="text-gray-500 font-bold text-sm mb-1">전주 대비 매출 변화</h4>
                            <span className="text-2xl font-bold text-red-600">
                                {event.metrics.salesChange.toLocaleString()}원
                            </span>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition-shadow">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                <AlertTriangle className="w-6 h-6 text-gray-600" />
                            </div>
                            <h4 className="text-gray-500 font-bold text-sm mb-1">원인 카테고리</h4>
                            <span className="text-xl font-bold text-gray-800">
                                {event.metrics.dropCategory}
                            </span>
                            <span className="text-sm font-bold text-red-500 mt-1">
                                매출 {event.metrics.dropRate} 하락
                            </span>
                        </div>
                    </div>
                )}
            </div>
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
