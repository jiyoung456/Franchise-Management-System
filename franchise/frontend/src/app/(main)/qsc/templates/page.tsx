'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { QscService } from '@/services/qscService';
import { QSCTemplate } from '@/types';
import { Plus, Search, Filter, Info, ChevronRight, FileCheck, CheckCircle2, XCircle } from 'lucide-react';

export default function TemplateListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<QSCTemplate[]>([]);

    useEffect(() => {
        // Load templates from storage
        const loadedTemplates = QscService.getTemplates();

        // Use Mock data if empty for demo purposes
        if (loadedTemplates.length === 0) {
            const { MOCK_TEMPLATES } = require('@/lib/mock/mockQscData');
            setTemplates(MOCK_TEMPLATES);
        } else {
            setTemplates(loadedTemplates);
        }
    }, []);

    const filteredTemplates = templates.filter(tpl =>
        tpl.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 mx-auto w-full pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">점검 템플릿 관리</h1>
                <p className="text-sm text-gray-500 mt-1">점검 템플릿은 점검 기준과 점수 산출의 기준이 되며, 활성화된 최신 버전만 신규 점검에 사용됩니다.</p>
            </div>

            {/* Actions & Content Container */}
            <div className="flex flex-col space-y-4">

                {/* Top Action Bar */}
                <div className="flex justify-end">
                    <Link
                        href="/qsc/templates/new"
                        className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-1.5" />
                        새 점검 템플릿 등록
                    </Link>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">

                    {/* Filter & Search Bar */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 font-bold">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <span>필터</span>
                        </div>

                        {/* Mock Filter Chips/Inputs */}
                        <div className="flex flex-wrap gap-2 flex-1 md:justify-end">
                            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none">
                                <option>전체 유형</option>
                                <option>정기 점검</option>
                                <option>특별 점검</option>
                            </select>
                            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none">
                                <option>전체 범위</option>
                                <option>전체 매장</option>
                                <option>특정 권역</option>
                            </select>
                            <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none">
                                <option>활성 상태</option>
                                <option>사용 중</option>
                                <option>비활성</option>
                            </select>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-4 h-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-10 p-2.5 w-60 outline-none transition-all focus:ring-2"
                                    placeholder="템플릿 명칭 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* List Items */}
                    <div className="p-6 space-y-4">
                        {filteredTemplates.map(tpl => (
                            <div key={tpl.id} className="group relative flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{tpl.title}</h3>
                                            {tpl.isActive ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                                    <CheckCircle2 className="w-3 h-3" /> 사용 중
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <XCircle className="w-3 h-3" /> 비활성
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-500 flex flex-wrap gap-x-3 items-center">
                                            <span>{tpl.type}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{tpl.scope}</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="font-medium text-gray-700">Ver {tpl.version}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 md:mt-0 flex items-center justify-end">
                                    <Link
                                        href={`/qsc/templates/${tpl.id}`}
                                        className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 font-bold text-sm transition-colors"
                                    >
                                        상세
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {filteredTemplates.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <p>검색 결과가 없습니다.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
