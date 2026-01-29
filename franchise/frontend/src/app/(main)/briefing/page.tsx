'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BriefingWidget from '@/components/dashboard/BriefingWidget';
import { MOCK_BRIEFING } from '@/lib/mock/mockBriefingData';
// import { StorageService } from '@/lib/storage'; // Removed
import { AuthService } from '@/services/authService';
import { User } from '@/types';

export default function BriefingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const init = async () => {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                router.replace('/login');
                return;
            }
            setUser(currentUser);
        };
        init();
    }, [router]);

    if (!user) return <div className="p-12 text-center text-gray-500 font-bold">로딩 중...</div>;

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
