'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StorageService } from '@/lib/storage';

// Mock Data for Detail
const MOCK_ACTION_DETAIL: Record<string, any> = {
    '1': {
        id: 1, title: '위생 점검 재이행', store: '강남점', relatedEvent: '이벤트11', type: '방문',
        assignee: '김슈퍼', metric: '위생점수', deadline: '2026-01-15', priority: 'HIGH (빠른 대응)',
        description: '지난 QSC 점검에서 식자재 보관 상태가 미흡하여 재점검이 필요합니다. 방문하여 냉장/냉동고 온도를 확인하고 식자재 라벨링 상태를 전수 조사해주시기 바랍니다.'
    }
};

export default function ActionDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const action = MOCK_ACTION_DETAIL[params.id] || MOCK_ACTION_DETAIL['1']; // Fallback
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | null>(null);
    const [rank, setRank] = useState<string | null>(null);

    useEffect(() => {
        StorageService.init();
        const user = StorageService.getCurrentUser();
        if (user) {
            setRole(user.role);
            setRank(user.rank);
        }
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <button onClick={() => router.back()} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">조치 상세보기</h1>
            </div>

            {/* Info Table */}
            <div className="bg-white border border-gray-400 rounded-sm">
                <div className="divide-y divide-gray-200">
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">제목</div>
                        <div className="flex-1 p-4 text-gray-900 font-medium">{action.title}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">대상 점포</div>
                        <div className="flex-1 p-4 text-gray-900">{action.store}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">연관 이벤트</div>
                        <div className="flex-1 p-4 text-gray-900">{action.relatedEvent}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">조치 유형</div>
                        <div className="flex-1 p-4 text-gray-900">{action.type}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">담당자</div>
                        <div className="flex-1 p-4 text-gray-900">{action.assignee}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">목표 지표</div>
                        <div className="flex-1 p-4 text-gray-900">{action.metric}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">기한</div>
                        <div className="flex-1 p-4 text-gray-900">{action.deadline}</div>
                    </div>
                    <div className="flex">
                        <div className="w-40 bg-gray-50 p-4 font-bold text-gray-700 border-r border-gray-200 flex items-center">우선순위</div>
                        <div className="flex-1 p-4 text-gray-900">{action.priority}</div>
                    </div>
                </div>
            </div>

            {/* Description Area */}
            <div>
                <h3 className="text-sm font-bold text-gray-500 mb-2 pl-1">조치 내용</h3>
                <div className="w-full bg-gray-100 p-8 rounded border border-gray-300 min-h-[150px] flex items-center justify-center text-gray-800 font-medium whitespace-pre-line text-center">
                    {action.description}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4">
                {/* SV: Write Execution Result & View Effect */}
                {role === 'SUPERVISOR' && (
                    <>
                        {rank === 'SV_SUPERVISOR' && (
                            <button
                                onClick={() => router.push(`/actions/${params.id}/execution`)}
                                className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 shadow-sm"
                            >
                                조치 수행 결과 작성
                            </button>
                        )}
                        <button
                            onClick={() => router.push(`/actions/${params.id}/effect`)}
                            className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm"
                        >
                            효과보기
                        </button>
                    </>
                )}

                {/* Admin: View Effect Only */}
                {role === 'ADMIN' && (
                    <button
                        onClick={() => router.push(`/actions/${params.id}/effect`)}
                        className="px-6 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-sm"
                    >
                        효과보기
                    </button>
                )}

                {/* Team Leader: Edit Action */}
                {rank === 'SV_TEAM_LEADER' && (
                    <button
                        onClick={() => router.push(`/actions/${params.id}/edit`)}
                        className="px-6 py-2 border border-blue-600 bg-white text-blue-600 font-bold rounded hover:bg-blue-50"
                    >
                        수정
                    </button>
                )}

                <button
                    onClick={() => router.push('/actions')}
                    className="px-6 py-2 border border-gray-400 bg-white text-gray-800 font-bold rounded hover:bg-gray-50"
                >
                    목록
                </button>
            </div>
        </div>
    );
}
