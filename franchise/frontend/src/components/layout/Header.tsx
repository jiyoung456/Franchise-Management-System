'use client';

import { Bell, Search, Menu, LogOut, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AuthService } from '@/services/authService';
import { EventService } from '@/services/eventService'; // Import EventService
import { User as UserType, EventLog } from '@/types'; // Import EventLog
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
    'ADMIN': '본사관리자',
    'MANAGER': 'SV팀장',
    'SUPERVISOR': '슈퍼바이저'
};

export function Header() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [notifications, setNotifications] = useState<EventLog[]>([]);

    useEffect(() => {
        // Initialize Storage (if needed) and get current user
        AuthService.init();
        setUser(AuthService.getCurrentUser());

        // Fetch Events for Notifications
        const allEvents = EventService.getEvents();
        // Filter for Critical/High Open events
        const notis = allEvents.filter(e => e.status === 'OPEN' && (e.severity === 'CRITICAL' || e.severity === 'WARNING'));
        setNotifications(notis);
    }, []);

    const handleLogout = () => {
        AuthService.logout();
    };

    const hasUnread = notifications.length > 0;

    return (
        <header className="h-16 bg-[#46B3E6] border-b border-[#3AA0D0] fixed w-full top-0 right-0 z-10 pl-64">
            <div className="h-full px-6 flex items-center justify-end">
                {/* Search Removed */}

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            className="p-2 hover:bg-white/10 rounded-lg relative transition-colors"
                            onClick={() => setIsNotiOpen(!isNotiOpen)}
                        >
                            <Bell className="w-5 h-5 text-white" />
                            {hasUnread && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            )}
                        </button>

                        {isNotiOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-gray-900">알림 ({notifications.length})</h3>
                                    <Link href="/events" className="text-xs text-blue-600 hover:underline" onClick={() => setIsNotiOpen(false)}>
                                        전체 보기
                                    </Link>
                                </div>

                                {notifications.length > 0 ? (
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map(evt => (
                                            <Link
                                                key={evt.id}
                                                href={`/stores/${evt.storeId}`}
                                                className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                onClick={() => setIsNotiOpen(false)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-900 mb-0.5">{evt.storeName}</p>
                                                        <p className="text-xs text-gray-600 line-clamp-2">{evt.message}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{evt.timestamp.slice(5, 16).replace('T', ' ')}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-8 text-center text-xs text-gray-500">
                                        새로운 중요 알림이 없습니다.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

                    <div className="relative">
                        <button
                            className="flex items-center gap-2 cursor-pointer hover:bg-white/10 p-1 rounded-lg text-left transition-colors"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                        >
                            <div className="w-8 h-8 rounded-full bg-white text-[#46B3E6] flex items-center justify-center font-bold text-xs overflow-hidden">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                            <div className="text-sm hidden md:block">
                                <p className="font-medium text-white">
                                    {user ? `${user.userName.length > 1 ? user.userName.slice(0, -1) + '*' : user.userName}님 ${ROLE_LABELS[user.role] || ''}` : ''}
                                </p>
                            </div>
                        </button>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                <Link
                                    href="/mypage"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    onClick={() => setIsProfileOpen(false)}
                                >
                                    <div className="flex items-center">
                                        <User className="w-4 h-4 mr-2" />
                                        마이페이지
                                    </div>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <div className="flex items-center">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        로그아웃
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
