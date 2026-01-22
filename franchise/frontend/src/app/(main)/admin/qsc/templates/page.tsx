'use client';

import { useState, useEffect } from 'react';
import { StorageService, QSCTemplate } from '@/lib/storage'; // ensure import matches
import Link from 'next/link';
import { Plus, Search, FileText, Calendar, CheckCircle, XCircle } from 'lucide-react';

export default function TemplateListPage() {
    const [templates, setTemplates] = useState<QSCTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Init Storage (just in case)
        StorageService.init();
        const data = StorageService.getTemplates();
        setTemplates(data);
        setIsLoading(false);
    }, []);

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading templates...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">QSC 점검 템플릿 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        정기 점검 및 위생 점검에 사용할 체크리스트 템플릿을 생성하고 관리합니다.
                    </p>
                </div>
                <Link
                    href="/admin/qsc/templates/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    새 템플릿 생성
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="템플릿 명칭 검색..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">전체 상태</option>
                    <option value="active">사용 중</option>
                    <option value="inactive">미사용</option>
                </select>
            </div>

            {/* Template List */}
            <div className="grid gap-4">
                {templates.map(tpl => (
                    <div key={tpl.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${tpl.effective_to === null ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {tpl.title}
                                    </h3>
                                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                                        v{tpl.version}
                                    </span>
                                    {tpl.effective_to === null ? (
                                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-2">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Active
                                        </span>
                                    ) : (
                                        <div className="flex flex-col items-start ml-2">
                                            <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Expired
                                            </span>
                                            <span className="text-[10px] text-gray-400 mt-0.5">
                                                ~ {tpl.effective_to}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-1 mb-2">
                                    {tpl.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <span className="flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {tpl.createdAt} 생성
                                    </span>
                                    <span>•</span>
                                    <span>총 {tpl.items.length}개 항목</span>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/admin/qsc/templates/${tpl.id}`}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        >
                            관리 / 수정
                        </Link>
                    </div>
                ))}

                {templates.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500">등록된 템플릿이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
