'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QscInspectionPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to new inspection page
        router.replace('/qsc/inspection/new');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">새로운 점검 페이지로 이동합니다...</h2>
                <p className="text-gray-500">잠시만 기다려주세요.</p>
            </div>
        </div>
    );
}
