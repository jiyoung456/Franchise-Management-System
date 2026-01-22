'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditTemplateRedirect({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

    useEffect(() => {
        params.then(unwrapped => {
            router.replace(`/admin/qsc/templates/${unwrapped.id}`);
        });
    }, [params, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">이동 중...</h2>
                <p className="text-gray-500">최신 템플릿 에디터로 이동합니다.</p>
            </div>
        </div>
    );
}
