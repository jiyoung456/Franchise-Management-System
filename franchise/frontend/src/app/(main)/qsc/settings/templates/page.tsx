'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MOCK_TEMPLATES } from '@/lib/mock/mockQscData';
import { Plus, Search, Filter } from 'lucide-react';

export default function TemplateListPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Extended Mock Data for UI demonstration
    const templates = MOCK_TEMPLATES.map(t => ({
        ...t,
        type: '정기 점검', // Mock
        scope: '전체 매장' // Mock
    }));

    const filteredTemplates = templates.filter(tpl =>
        tpl.templateName.includes(searchTerm)
    );

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">헤더</h1>
            </div>

            {/* Info Message */}
            <div className="text-blue-600 text-sm mb-4">
                점검 템플릿은 점검 기준과 점수 산출의 기준이 되며, 활성화된 최신 버전만 신규 점검에 사용됩니다.
            </div>

            {/* Actions & Filters Container */}
            <div className="flex flex-col gap-4">
                {/* Top Action */}
                <div className="flex justify-end">
                    <Link
                        href="/qsc/settings/templates/new"
                        className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded font-medium hover:bg-gray-50 text-gray-700 shadow-sm"
                    >
                        + 새 점검 템플릿
                    </Link>
                </div>

                {/* Main List Box */}
                <div className="border border-gray-400 p-4 rounded-sm bg-white min-h-[500px]">

                    {/* Filter Area (Right Aligned Box) */}
                    <div className="flex justify-end mb-6">
                        <div className="border border-gray-400 p-4 w-1/3 min-w-[300px] text-sm text-gray-600">
                            필터 : 점검 유형, 적용 범위, 활성 상태, 템플릿명
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="space-y-3">
                        {filteredTemplates.map(tpl => (
                            <div key={tpl.templateId} className="flex items-center justify-between border border-gray-400 p-4 rounded-sm bg-white hover:bg-gray-50 transition-colors">
                                <div className="text-gray-900 font-medium">
                                    {tpl.templateName}, {tpl.scope}, {tpl.inspectionType}, 현재 버전 {tpl.version}, {tpl.isActive ? '사용 중' : '비활성'}
                                </div>
                                <Link
                                    href={`/qsc/settings/templates/${tpl.templateId}`}
                                    className="px-4 py-1.5 border border-gray-400 rounded bg-white text-gray-700 text-sm hover:bg-gray-100"
                                >
                                    관리/수정
                                </Link>
                            </div>
                        ))}

                        {/* Duplicate Mocks for visual fullness if needed, or just show real available */}
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between border border-gray-400 p-4 rounded-sm bg-white hover:bg-gray-50 transition-colors">
                                <div className="text-gray-900 font-medium">
                                    특별 점검 템플릿 {i}, 전체 매장, 특별 점검, 현재 버전 1.{i}, {i % 2 === 0 ? '사용 중' : '비활성'}
                                </div>
                                <button className="px-4 py-1.5 border border-gray-400 rounded bg-white text-gray-700 text-sm hover:bg-gray-100">
                                    관리/수정
                                </button>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
