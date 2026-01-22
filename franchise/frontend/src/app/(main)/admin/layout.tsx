'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { StorageService } from '@/lib/storage';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const user = StorageService.getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            alert('접근 권한이 없습니다. (본사 관리자 전용)');
            router.replace('/stores');
            return;
        }

        setIsAuthorized(true);
    }, []);

    if (!isAuthorized) {
        return null; // Or a loading spinner
    }

    return <>{children}</>;
}
