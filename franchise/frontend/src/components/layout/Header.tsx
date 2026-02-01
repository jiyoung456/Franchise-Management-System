'use client';

import { Bell, Search, Menu, LogOut, User, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { AuthService } from '@/services/authService';
import { EventService } from '@/services/eventService';
import { User as UserType, EventLog } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const ROLE_LABELS: Record<string, string> = {
    'ADMIN': '본사관리자',
    'MANAGER': '팀장',
    'SUPERVISOR': '슈퍼바이저'
};

export function Header() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [isNotiOpen, setIsNotiOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const [notifications, setNotifications] = useState<EventLog[]>([]);

    useEffect(() => {
        const init = async () => {
            await AuthService.init();
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);

            try {
                const allEvents = await EventService.getEvents();

                if (Array.isArray(allEvents)) {
                    const notis = allEvents.filter(e =>
                        e.status === 'OPEN' &&
                        (e.severity === 'CRITICAL' || e.severity === 'WARNING')
                    );
                    setNotifications(notis);
                } else {
                    setNotifications([]);
                }
            } catch (error) {
                console.error('헤더 알림 로드 실패:', error);
                setNotifications([]);
            }
        };
        init();
    }, []);

    const handleLogout = () => {
        AuthService.logout();
    };

    const hasUnread = notifications.some(n => n.status === 'OPEN');

    const handleNotificationClick = async (evt: EventLog) => {
        if (evt.status === 'OPEN') {
            const updatedEvent = { ...evt, status: 'ACKNOWLEDGED' as const };
            await EventService.saveEvent(updatedEvent);
            setNotifications(prev => prev.map(e => e.id === evt.id ? updatedEvent : e));
        }

        setIsNotiOpen(false);
        router.push(`/events/${evt.id}`);
    };

    const handleDeleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(e => e.id !== id));
    };

    return (
        <header className="h-16 bg-[#46B3E6] border-b border-[#3AA0D0] fixed w-full top-0 right-0 z-10 pl-64">
            <div className="h-full px-6 flex items-center justify-end">
                <div className="flex items-center gap-4">
                    {/* Notification Bell - Hide for ADMIN */}
                    {user?.role !== 'ADMIN' && (
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
                                                <div
                                                    key={evt.id}
                                                    className={`group relative block px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${evt.status === 'OPEN' ? 'bg-blue-50/30 hover:bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <div
                                                        className="flex items-start gap-3 cursor-pointer pr-6"
                                                        onClick={() => handleNotificationClick(evt)}
                                                    >
                                                        <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${evt.status === 'OPEN' ? 'text-red-500' : 'text-gray-400'}`} />
                                                        <div>
                                                            <p className={`text-xs mb-0.5 ${evt.status === 'OPEN' ? 'font-bold text-gray-900' : 'font-medium text-gray-500'}`}>
                                                                {evt.storeName}
                                                            </p>
                                                            <p className={`text-xs line-clamp-2 ${evt.status === 'OPEN' ? 'text-gray-700' : 'text-gray-400'}`}>
                                                                {evt.message}
                                                            </p>
                                                            {/* [수정됨] timestamp 사용 */}
                                                            <p className="text-[10px] text-gray-400 mt-1">{(evt.timestamp || '').slice(5, 16).replace('T', ' ')}</p>
                                                        </div>
                                                    </div>

                                                    {evt.status === 'ACKNOWLEDGED' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteNotification(evt.id);
                                                            }}
                                                            className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
                                                            title="알림 삭제"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
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
                    )}

                    <div className="h-6 w-[1px] bg-white/20 mx-2"></div>

                    {/* Profile Dropdown */}
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