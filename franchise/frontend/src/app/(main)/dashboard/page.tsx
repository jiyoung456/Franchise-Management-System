'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthService } from '@/services/authService';
import { User } from '@/types';
import { ManagerDashboard } from '@/components/dashboard/manager/ManagerDashboard';
import SVDashboard from '@/components/dashboard/SVDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const currentUser = await AuthService.getCurrentUser();
            if (!currentUser) {
                router.replace('/login');
                return;
            }
            setUser(currentUser);
            setIsLoading(false);
        };
        checkUser();
    }, []);

    if (isLoading || !user) return <div className="p-8 text-center">Loading...</div>;

    const isTeamLeader = user.role === 'SUPERVISOR' || user.role === 'ADMIN' || user.role === 'MANAGER';

    return (
        <>
            {user.role === 'ADMIN' ? (
                <AdminDashboard user={user} />
            ) : user.role === 'MANAGER' ? (
                <ManagerDashboard user={user} />
            ) : (
                <SVDashboard user={user} />
            )}
        </>
    );
}
