'use client';

import { MOCK_TEMPLATES } from '@/lib/mock/mockQscData';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Edit, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { useState } from 'react';

export default function TemplateDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const template = MOCK_TEMPLATES.find(t => t.templateId === id) || MOCK_TEMPLATES[0];

    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    // Mock Groups
    const categories = [
        { id: 'quality', title: 'Quality', count: 6, score: 30 },
        { id: 'service', title: 'Service', count: 5, score: 30 },
        { id: 'cleanliness', title: 'Cleanliness', count: 5, score: 30 },
        { id: 'safety', title: 'Safety', count: 2, score: 10 },
    ];

    const toggleCategory = (catId: string) => {
        setExpandedCategory(expandedCategory === catId ? null : catId);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4 border-gray-200">
                <div className="w-full text-center">
                    <h1 className="text-2xl font-bold text-gray-900">헤더</h1>
                </div>
            </div>

            {/* Content Box */}
            <div className="border border-gray-400 p-8 rounded-sm bg-white space-y-8">

                {/* 1. Basic Info */}
                <div className="border border-gray-400 p-6 rounded-sm text-center space-y-2">
                    <h3 className="font-bold text-lg mb-4 underline decoration-gray-300 underline-offset-4">기본 정보</h3>
                    <div className="text-gray-900">
                        {template?.templateName}, {template?.description}, 정기 점검, 전체 매장, 2025-01-01, 2026-01-15, 김관리, 현재 버전 {template?.version}, {template?.isActive ? '사용 중' : '비활성'}
                    </div>
                </div>

                {/* 2. Criteria Summary */}
                <div className="border border-gray-400 p-6 rounded-sm">
                    <h3 className="font-bold text-lg mb-6 text-gray-900">점검 기준 요약</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {categories.map(cat => (
                            <div key={cat.id} className="border border-gray-400 p-4 min-h-[120px] flex flex-col justify-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleCategory(cat.id)}>
                                <div className="font-bold text-xl mb-2">{cat.title}</div>
                                <div className="text-gray-600">항목 수 : {cat.count}개</div>
                                <div className="text-gray-600">총 배점 : {cat.score}점</div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right text-blue-500 text-sm mt-2">
                        상세 항목 카드 누르면 펼쳐져서 카테고리별 내용 확인 가능
                    </div>

                    {/* Expanded Detail View (Optional, just purely visual for now) */}
                    {expandedCategory && (
                        <div className="mt-6 p-4 bg-gray-50 border-t border-gray-200">
                            <h4 className="font-bold mb-2 text-gray-700">{categories.find(c => c.id === expandedCategory)?.title} 상세 항목</h4>
                            {/* Mock Items list */}
                            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                <li>항목 1 (5점) - 필수 / 사진 필수</li>
                                <li>항목 2 (5점) - 선택 / 사진 선택</li>
                                <li>항목 3 (10점) - 필수 / 사진 필수</li>
                            </ul>
                        </div>
                    )}
                </div>

                {/* 3. Usage Status */}
                <div className="border border-gray-400 p-6 rounded-sm">
                    <h3 className="font-bold text-lg mb-4 text-center">적용 현황 / 사용 현황</h3>
                    <div className="text-center text-lg text-gray-800">
                        최근 30일 점검 횟수 45회, 적용 중인 점포 수 120개, 불합격 발생 횟수 3건
                    </div>
                    <div className="text-right text-xs text-blue-500 mt-2">
                        예시 문구 : <br />
                        최근 30일 동안 18개 점포에서 사용됨 <br />
                        불합격 점검 3건 발생
                    </div>
                </div>

            </div>
        </div>
    );
}
