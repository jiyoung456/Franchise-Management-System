'use client';

import React, { useState } from 'react';
import { Store, AlertTriangle, CheckSquare, ClipboardList, MapPin, ChevronRight, BarChart3, Clock, AlertCircle, FileText, CheckCircle2, User as UserIcon, Calendar, Activity } from 'lucide-react';
import SVReportDrawer from './SVReportDrawer';
import { User } from '@/types';

// Fallback Mock Data
const MOCK_TODAY_STORES = [
    { id: 1, storeName: '강남역점', riskLevel: 'HIGH', reason: '매출 급락 + 위생 이슈', recommendation: '긴급 방문', region: '서울 강남' },
    { id: 2, storeName: '서초 1호점', riskLevel: 'MEDIUM', reason: '재고 로스율 증가', recommendation: '재고 실사', region: '서울 서초' },
    { id: 3, storeName: '양재 시민의숲점', riskLevel: 'HIGH', reason: '클레임 3건 접수', recommendation: '매니저 면담', region: '서울 서초' },
];

const MOCK_CHECKLIST = [
    { id: 1, title: '강남역점 긴급 위생 점검', type: 'VISIT_REQUIRED', priority: 'HIGH', done: false },
    { id: 2, title: '2025 상반기 정기 점검 템플릿 승인', type: 'ADMIN', priority: 'HIGH', done: false },
    { id: 3, title: '서초 1호점 재고 리포트 확인', type: 'REPORT', priority: 'MEDIUM', done: true },
    { id: 4, title: '신규 아르바이트 교육 자료 배포', type: 'EDUCATION', priority: 'LOW', done: false },
];

const MOCK_SUMMARY = {
    riskCount: 5,
    urgentCheck: 3,
    pendingApproval: 2
};

export default function SVDashboard({ user }: { user: User }) {
    const [selectedStore, setSelectedStore] = useState<any | null>(null);
    const [checklist, setChecklist] = useState(MOCK_CHECKLIST);

    const toggleCheck = (id: number) => {
        setChecklist(prev => prev.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    return (
        <div className="space-y-8 font-sans pb-20">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">SV 현장 대시보드</h1>
                    <p className="text-sm text-gray-500">반갑습니다, <span className="font-bold text-gray-700">{user.userName || '홍길동'} SV님</span>. 오늘의 핵심 매장 지표를 분석했습니다.</p>
                </div>
                <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    2025년 9월 1일 (월)
                </div>
            </div>

            {/* 1. Today's Stores to Check (Main Section) */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">오늘 확인이 필요한 매장</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_TODAY_STORES.map((store) => (
                        <div key={store.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between h-64 hover:shadow-md transition-shadow">

                            {/* Card Top: Badges */}
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded text-xs font-bold ${store.riskLevel === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                    {store.riskLevel === 'HIGH' ? '심각' : '주의'}
                                </span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${store.riskLevel === 'HIGH' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                                    }`}>
                                    <Activity size={16} />
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="mb-auto">
                                <h3 className="text-lg font-bold text-gray-900 mb-3">{store.storeName}</h3>
                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <p className="text-sm font-bold text-gray-800 break-keep leading-snug">
                                        {store.reason}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 uppercase font-bold tracking-wider">
                                    <span>CATEGORY</span>
                                    <span className="text-gray-600">OPERATION</span>
                                </div>
                            </div>

                            {/* Card Action */}
                            <button
                                onClick={() => setSelectedStore(store)}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm shadow-sm transition-colors"
                            >
                                위험 진단 리포트 확인
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 2. Bottom Section: Checklist & Summary */}
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                오늘의 할 일 <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">2025-09-01</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Checklist */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-blue-600" />
                            체크리스트 (Checklist)
                        </h3>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">미완료 3건</span>
                    </div>

                    <div className="space-y-4">
                        {checklist.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => toggleCheck(item.id)}
                                className={`group p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${item.done
                                    ? 'bg-gray-50 border-gray-100 opacity-50'
                                    : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${item.done ? 'bg-gray-300 border-gray-300' : 'bg-white border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                        {item.done && <CheckSquare size={12} className="text-white" />}
                                    </div>

                                    <div className="flex-1">
                                        <p className={`font-bold text-gray-900 text-sm mb-2 ${item.done && 'line-through text-gray-400'}`}>
                                            {item.title}
                                        </p>
                                        <div className="flex gap-2">
                                            {item.priority === 'HIGH' ? (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">HIGH</span>
                                            ) : item.priority === 'MEDIUM' ? (
                                                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">MEDIUM</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">LOW</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Right: Summary */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <FileText size={20} className="text-purple-600" />
                        운영 요약 (Summary)
                    </h3>

                    <div className="flex-1 bg-gray-50/50 rounded-xl p-6 border border-gray-100 mb-6 flex gap-4">
                        <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center text-gray-400 shrink-0">
                            <UserIcon size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 mb-2">{user.userName || '박팀장'}님,</p>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                오늘 강남권역의 리스크 점수가 전일 대비 15% 상승했습니다.
                                특히 <span className="font-bold text-gray-900">'강남역점'</span>의 위생 등급 하락 리스크가 감지되어 긴급 점검이 필요합니다.
                                2건의 템플릿 승인 요청이 대기 중입니다.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                            <p className="text-xs text-gray-500 font-bold mb-1">총 이슈</p>
                            <p className="text-xl font-extrabold text-gray-900">5</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                            <p className="text-xs text-gray-500 font-bold mb-1">심각</p>
                            <p className="text-xl font-extrabold text-red-600">2</p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                            <p className="text-xs text-gray-500 font-bold mb-1">승인 대기</p>
                            <p className="text-xl font-extrabold text-blue-600">2</p>
                        </div>
                    </div>
                </section>

            </div>

            <SVReportDrawer
                isOpen={!!selectedStore}
                onClose={() => setSelectedStore(null)}
                data={selectedStore}
            />
        </div>
    );
}
