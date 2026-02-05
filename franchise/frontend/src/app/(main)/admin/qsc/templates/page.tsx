'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, CheckCircle, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { QSCTemplate } from '@/types';
import { adminQscService } from '@/services/adminQscService';

export default function TemplateListPage() {
    const [templates, setTemplates] = useState<QSCTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        scope: '',
        keyword: ''
    });

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                // 직접 백엔드 DTO 배열을 받아옵니다.
                const data = await adminQscService.getTemplates({
                    type: filters.type || undefined,
                    status: filters.status || undefined,
                    keyword: filters.keyword || undefined
                });

                console.log("DEBUG: DB에서 가져온 원본 데이터:", data);
                setTemplates(data);
            } catch (error) {
                console.error('Failed to load templates:', error);
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [filters]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">점검 템플릿 관리 (Backend Direct)</h1>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                        백엔드 API(/api/admin/qsc/templates)와 직접 연동된 데이터입니다.
                    </p>
                </div>
                <Link
                    href="/admin/qsc/templates/new"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 flex items-center transition-all hover:-translate-y-0.5"
                >
                    <Plus className="w-4 h-4 mr-2 stroke-[3]" />
                    새 점검 템플릿 등록
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-500 whitespace-nowrap">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="text-sm font-bold">필터</span>
                </div>

                <div className="flex flex-1 items-center gap-3">
                    <select
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="px-3 py-2 border border-gray-100 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-600"
                    >
                        <option value="">전체 유형</option>
                        <option value="REGULAR">정기 점검</option>
                        <option value="SPECIAL">특별 점검</option>
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-100 bg-gray-50/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-gray-600"
                    >
                        <option value="">활성 상태</option>
                        <option value="ACTIVE">사용 중</option>
                        <option value="INACTIVE">미사용</option>
                    </select>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="템플릿 명칭 검색"
                            value={filters.keyword}
                            onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Template List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                        <p className="text-gray-400 text-sm mt-4 font-medium">데이터를 불러오는 중입니다...</p>
                    </div>
                ) : (
                    <>
                        {templates.map(tpl => (
                            <div key={tpl.templateId} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <FileText className="w-6 h-6 stroke-[1.5]" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {tpl.templateName}
                                                </h3>
                                                {tpl.status === 'ACTIVE' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-green-50 text-green-600">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        사용 중
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-50 text-gray-400">
                                                        미사용
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-gray-400">
                                                <span>{tpl.inspectionType === 'REGULAR' ? '정기 점검' : tpl.inspectionType === 'SPECIAL' ? '특별 점검' : '재점검'}</span>
                                                <span className="text-gray-200">·</span>
                                                <span>{tpl.scope || '전체 매장'}</span>
                                                <span className="text-gray-200">·</span>
                                                <span className="font-mono text-xs">Ver {tpl.version}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/admin/qsc/templates/${tpl.templateId}`}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-50 text-gray-500 font-bold text-[13px] hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
                                    >
                                        상세
                                        <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {templates.length === 0 && (
                            <div className="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-bold">등록된 템플릿이 없습니다.</p>
                                <p className="text-gray-300 text-sm mt-1">새로운 점검 기준을 만들어 보세요.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
