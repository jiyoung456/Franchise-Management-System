'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Filter, Search, Calendar, ChevronDown } from 'lucide-react';
import { MOCK_INSPECTIONS } from '@/lib/mock/mockQscData';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { ScoreBar } from '@/components/common/ScoreBar';

export default function QscHistoryPage() {
    const router = useRouter();
    const params = useParams();
    const storeId = params.storeId as string;
    // Fix: storeId is number in mockData
    const store = MOCK_STORES.find(s => s.id.toString() === storeId);

    // Filters
    const [period, setPeriod] = useState<'3M' | '6M' | '1Y'>('3M');

    // Filter Data
    const history = useMemo(() => {
        return MOCK_INSPECTIONS
            .filter(i => i.storeId === storeId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        // In real app, apply date filtering based on 'period' here
    }, [storeId, period]);

    if (!store) return <div className="p-8">Store not found</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{store.name} QSC 점검 이력</h1>
                    <p className="text-sm text-gray-500">이 점포의 과거 점검 내역을 조회합니다.</p>
                </div>
            </div>

            {/* Filter Bar (Wireframe style) */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm">

                {/* Store Name (Read only or Selector) */}
                <div className="flex-none w-48 border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-700 font-bold text-center">
                    {store.name}
                </div>

                {/* Period Select */}
                <div className="flex-1 flex justify-center">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            onClick={() => setPeriod('3M')}
                            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-l-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${period === '3M' ? 'bg-blue-50 text-blue-600 z-10 ring-1 ring-blue-700' : 'bg-white text-gray-900'}`}
                        >
                            3개월
                        </button>
                        <button
                            onClick={() => setPeriod('6M')}
                            className={`px-4 py-2 text-sm font-medium border-t border-b border-gray-200 hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${period === '6M' ? 'bg-blue-50 text-blue-600 z-10 ring-1 ring-blue-700' : 'bg-white text-gray-900'}`}
                        >
                            6개월
                        </button>
                        <button
                            onClick={() => setPeriod('1Y')}
                            className={`px-4 py-2 text-sm font-medium border border-gray-200 rounded-r-lg hover:bg-gray-100 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 ${period === '1Y' ? 'bg-blue-50 text-blue-600 z-10 ring-1 ring-blue-700' : 'bg-white text-gray-900'}`}
                        >
                            1년
                        </button>
                    </div>
                </div>

                {/* Generic Filter (Mock) */}
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-700">
                    <Filter className="w-4 h-4" />
                    필터
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {history.map((inspection) => (
                        <div
                            key={inspection.id}
                            onClick={() => router.push(`/qsc/report/${inspection.id}`)}
                            className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                            <div className="flex items-center justify-between">
                                {/* Left: Info Line */}
                                <div className="flex items-center gap-3 text-lg">
                                    <span className="font-bold text-gray-900">{inspection.date}</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="font-medium text-gray-700">{inspection.type}</span>
                                    <span className="text-gray-300">|</span>

                                    {/* Status Badge */}
                                    <span className={`px-2 py-0.5 rounded text-sm font-bold ${inspection.status === '완료' ? 'bg-blue-100 text-blue-700' :
                                        inspection.status === '점주확인' ? 'bg-purple-100 text-purple-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        {inspection.status}
                                    </span>

                                    <span className="text-gray-300">|</span>

                                    {/* Pass/Fail */}
                                    {inspection.isPassed ? (
                                        <span className="text-green-600 font-bold">합격</span>
                                    ) : (
                                        <span className="text-red-600 font-bold">불합격</span>
                                    )}

                                    {/* Reinspection Needed */}
                                    {inspection.isReinspectionNeeded && (
                                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-bold ml-2">재점검 필요</span>
                                    )}

                                    <span className="text-gray-300">|</span>

                                    {/* Score */}
                                    <span className={`font-bold ${inspection.score < 80 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {inspection.score}점
                                    </span>

                                    <span className="text-gray-300">|</span>

                                    {/* Grade */}
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${inspection.grade === 'S' || inspection.grade === 'A' ? 'bg-green-500' :
                                        inspection.grade === 'B' ? 'bg-yellow-400' :
                                            'bg-red-500'
                                        }`}>
                                        {inspection.grade}
                                    </span>
                                </div>

                                {/* Right: CTA Text */}
                                <div className="text-sm text-blue-500 font-medium group-hover:underline hidden md:block">
                                    리스트 클릭시 QSC 점검 이력 조회 상세 페이지로
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            해당 기간에 점검 이력이 없습니다.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
