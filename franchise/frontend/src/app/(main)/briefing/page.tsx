'use client';

import { useEffect, useState } from 'react';
import BriefingWidget from '@/components/dashboard/BriefingWidget';
import { MOCK_BRIEFING } from '@/lib/mock/mockBriefingData';
import { StorageService } from '@/lib/storage';

export default function BriefingPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        StorageService.init();
        const currentUser = StorageService.getCurrentUser();
        setUser(currentUser);
    }, []);

    if (!user) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">운영 브리핑</h1>
                <p className="text-sm text-gray-500 mt-1">오늘의 중요 이슈와 할 일을 한눈에 확인하세요.</p>
            </div>

            <BriefingWidget data={MOCK_BRIEFING} userName={user.userName} />
        </div>
    );
}
