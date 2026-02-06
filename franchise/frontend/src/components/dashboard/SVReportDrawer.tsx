'use client';

import React, { useState } from 'react';
import { X, Calendar, FileText, CheckCircle2, AlertTriangle, TrendingUp, ClipboardCheck, Info } from 'lucide-react';

interface SVReportDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    data: any | null; // Using any for mock flexibility
}

type TabType = 'INFO' | 'EVENT' | 'ACTION' | 'QSC' | 'RISK';

export default function SVReportDrawer({ isOpen, onClose, data }: SVReportDrawerProps) {
    const [activeTab, setActiveTab] = useState<TabType>('QSC');

    if (!isOpen || !data) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 w-[600px] bg-gray-50 shadow-2xl z-50 transform transition-transform duration-300 flex flex-col font-sans border-l border-gray-200">

                {/* Header Area */}
                <div className="bg-white p-6 pb-2 shadow-sm z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-gray-900">{data.storeName}</h2>
                            <div className="flex flex-col text-xs text-gray-500 font-medium leading-tight">
                                <span>서울 / sv01</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Top Stats Cards Row */}
                    <div className="flex gap-4 mb-6">
                        {/* AI Summary Card */}
                        <div className="flex-1 bg-white border border-blue-100 rounded-lg p-4 flex gap-3 shadow-sm relative overflow-hidden group">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            <div>
                                <h3 className="text-xs font-bold text-blue-600 mb-1">AI 요약 리포트</h3>
                                <p className="text-sm text-gray-700 font-medium leading-normal">
                                    {data.reason || '특이사항 없습니다.'}
                                </p>
                            </div>
                        </div>

                        {/* Status Card */}
                        <div className="w-32 bg-white border border-gray-100 rounded-lg p-3 flex flex-col items-center justify-center shadow-sm">
                            <span className="text-xs font-bold text-gray-500 mb-1">운영 상태</span>
                            <span className="text-lg font-extrabold text-gray-900 mb-1">OPEN</span>
                            <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full">
                                <span className="text-[10px] text-blue-600 font-bold">리스크: 정상</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score & Metrics Area */}
                <div className="p-6 grid grid-cols-2 gap-4">
                    {/* Risk Score */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-4">종합 위험 점수 <AlertTriangle size={14} className="inline text-red-500 -mt-0.5" /></h3>
                        <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden mb-2">
                            <div className="absolute top-0 left-0 h-full bg-red-500 w-3/4 rounded-full" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-extrabold text-red-600">75</span>
                            <span className="text-sm text-gray-400 font-bold">/ 100</span>
                        </div>
                    </div>

                    {/* QSC Score */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">최근 QSC 점수</h3>
                        <span className="text-4xl font-extrabold text-blue-600 mb-2">92점</span>
                        <span className="text-xs text-gray-400">지난달 대비 +2점 상승</span>
                    </div>
                </div>

                {/* Tabs Navigation (Simplified) */}
                <div className="px-6 border-b border-gray-200 bg-white flex gap-6 text-sm font-bold sticky top-0">
                    <button
                        className="py-3 border-b-2 border-blue-600 text-blue-600 transition-colors"
                    >
                        가게 정보
                    </button>
                    {/* Removed other tabs as requested */}
                </div>

                {/* Content Area (Store Info) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <FileText size={20} className="text-gray-600" />
                        기본 정보
                    </h3>

                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">오픈일</span>
                                <span className="text-sm text-blue-600 font-medium">2020-03-15 (D+2154일)</span>
                            </div>
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">마지막 상태 변경일</span>
                                <span className="text-sm text-gray-500">-</span>
                            </div>
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">점주명</span>
                                <span className="text-sm text-gray-700">박현수</span>
                            </div>
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">점주 연락처</span>
                                <span className="text-sm text-gray-700 font-mono">010-1001-0002</span>
                            </div>
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">점포 주소</span>
                                <span className="text-sm text-gray-700">서울 강남구 테헤란로 120</span>
                            </div>
                            <div className="flex p-4 hover:bg-gray-50 transition-colors">
                                <span className="w-32 text-sm font-bold text-gray-900">계약 유형</span>
                                <span className="text-sm text-gray-700">(만료: 2025-02-14)</span>
                            </div>
                        </div>
                    </div>
                </div>



            </div>
        </>
    );
}
