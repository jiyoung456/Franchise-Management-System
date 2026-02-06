'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditTemplateRedirect() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            router.replace(`/admin/qsc/templates/${id}`);
        }
    }, [id, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">이동 중...</h2>
                <p className="text-gray-500">최신 템플릿 상세 페이지로 이동합니다.</p>
            </div>
        </div>
    );
}
