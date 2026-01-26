'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Store, ClipboardCheck, BarChart3, BrainCircuit, Settings, Users, TrendingUp, Megaphone, Calendar, CheckSquare, Hammer, AlertTriangle } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { Logo } from '@/components/common/Logo';

const navigation = [
    { name: '홈', href: '/', icon: LayoutDashboard, roles: ['ADMIN', 'SUPERVISOR'] },
    { name: '오늘의 할 일', href: '/briefing', icon: BrainCircuit, roles: ['SUPERVISOR'] }, // Dedicated Page (Team Leader sees via override)
    { name: '점포 관리', href: '/stores', icon: Store, roles: ['ADMIN', 'SUPERVISOR'] },
    { name: 'QSC 관리', href: '/qsc', icon: ClipboardCheck, roles: ['ADMIN', 'SUPERVISOR'] },
    { name: 'POS 성과 분석', href: '/performance', icon: BarChart3, roles: ['ADMIN', 'SUPERVISOR'] },
    { name: '이벤트 관리', href: '/events', icon: Calendar, roles: ['ADMIN', 'SUPERVISOR'] },
    {
        name: '조치/권한 관리',
        href: '#',
        icon: Hammer,
        roles: ['ADMIN', 'SUPERVISOR'],
        children: [
            { name: '조치 관리', href: '/actions', roles: ['ADMIN', 'SUPERVISOR'] },
            { name: '권한 관리', href: '/admin/users', roles: ['ADMIN'] }
        ]
    },
    { name: '위험 현황', href: '/ai-insight', icon: AlertTriangle, roles: ['ADMIN'] }, // Admin Only
    { name: '게시판', href: '/board', icon: Megaphone, roles: ['ADMIN', 'SUPERVISOR'] },
];

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);

    useEffect(() => {
        // Hydration safe check
        const user = AuthService.getCurrentUser();
        if (user) {
            setRole(user.role);
        } else {
            // If no user found, redirect to login
            // But checking pathname to avoid redirect loop if already on login is not needed inside Sidebar
            // because Sidebar is only in (main) layout, not (auth).
            // So safe to redirect.
            router.push('/login');
        }
    }, [router]);

    // Custom Navigation for Team Leader
    const teamLeaderNav = [
        { name: '홈', href: '/', icon: LayoutDashboard },
        { name: '오늘의 할 일', href: '/briefing', icon: BrainCircuit },
        { name: '이벤트 관리', href: '/events', icon: Calendar }, // Using Calendar for Event as per mock
        { name: '조치 관리', href: '/actions', icon: Hammer },
        { name: '게시판', href: '/board', icon: Megaphone },
    ];

    // Filter navigation based on Role
    let filteredNav = navigation.filter(item => {
        if (!role) return false;
        const targetRoles = item.roles as string[];
        const hasAccess = role === 'MANAGER' ? targetRoles.includes('SUPERVISOR') : targetRoles.includes(role);
        return hasAccess;
    }).map(item => {
        // Filter children if they exist
        if ((item as any).children) {
            const children = (item as any).children as any[];
            const filteredChildren = children.filter(child => {
                if (!child.roles) return true; // Default allow if no roles definition
                const childRoles = child.roles as string[];
                if (!role) return false;
                if (role === 'MANAGER') return childRoles.includes('SUPERVISOR');
                return childRoles.includes(role);
            });
            return { ...item, children: filteredChildren };
        }
        return item;
    });

    // Override for Team Leader (MANAGER)
    if (role === 'MANAGER') {
        filteredNav = teamLeaderNav.map(item => ({ ...item, roles: ['SUPERVISOR'] })) as any;
    }

    // Add sub-menu for QSC based on Role
    if (role === 'SUPERVISOR') { // Ordinary Supervisor
        const qscIndex = filteredNav.findIndex(item => item.href === '/qsc');
        if (qscIndex !== -1) {
            (filteredNav[qscIndex] as any).children = [
                { name: '대시보드', href: '/qsc' },
                { name: '내 담당 점포 현황', href: '/qsc/my-stores' },
                { name: 'QSC 점검', href: '/qsc/inspection' }
            ];
        }
    } else if (role === 'ADMIN') {
        const qscIndex = filteredNav.findIndex(i => i.href === '/qsc');
        if (qscIndex !== -1) {
            (filteredNav[qscIndex] as any).children = [
                { name: 'QSC 점검 결과', href: '/qsc' },
                { name: 'QSC 템플릿', href: '/qsc/templates' }
            ];
        }
    }

    // State for Accordion
    const [expandedMenus, setExpandedMenus] = useState<string[]>(['QSC 관리', '조치/권한 관리']); // Default open for QSC/Action for demo

    const toggleMenu = (name: string) => {
        setExpandedMenus(prev =>
            prev.includes(name)
                ? prev.filter(item => item !== name)
                : [...prev, name]
        );
    };

    return (
        <div className="w-64 bg-[#46B3E6] text-white h-screen flex flex-col fixed left-0 top-0 border-r border-[#3AA0D0] z-20">
            <div className="p-6 h-16 flex items-center border-b border-[#3AA0D0]">
                <Link href="/" className="flex items-center gap-2">
                    <Logo variant="white" />
                </Link>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <div className="space-y-1">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '#' && item.href !== '/ai-insight');
                        const hasChildren = (item as any).children && (item as any).children.length > 0;
                        const isExpanded = expandedMenus.includes(item.name);
                        const isChildActive = hasChildren && (item as any).children.some((child: any) => pathname === child.href || pathname.startsWith(child.href));

                        // Auto-expand if child is active (optional, but good UX)
                        /* 
                        useEffect(() => {
                            if (isChildActive && !isExpanded) {
                                setExpandedMenus(prev => [...prev, item.name]);
                            }
                        }, [pathname]); 
                        // Skipping auto-expand complexity for now to keep it simple manual toggle as requested
                        */

                        return (
                            <div key={item.name}>
                                {hasChildren ? (
                                    <button
                                        onClick={() => toggleMenu(item.name)}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded transition-colors group ${isChildActive || isActive
                                            ? 'text-white bg-[#5bc2f0]/50' // Slightly different base for active parent
                                            : 'text-white/90 hover:bg-[#5bc2f0] hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className={`h-5 w-5 mr-3 text-white`} strokeWidth={1.5} />
                                            {item.name}
                                        </div>
                                        {/* Chevron */}
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`flex items-center px-4 py-3 text-sm font-medium rounded transition-colors group ${isActive
                                            ? 'bg-white text-[#46B3E6] shadow-md font-bold'
                                            : 'text-white/90 hover:bg-[#5bc2f0] hover:text-white'
                                            }`}
                                    >
                                        <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-[#46B3E6]' : 'text-white'}`} strokeWidth={1.5} />
                                        {item.name}
                                    </Link>
                                )}

                                {hasChildren && isExpanded && (
                                    <div className="pl-4 mt-1 space-y-1 pb-2">
                                        {(item as any).children.map((child: any) => {
                                            const isChildActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`block px-4 py-2 text-sm rounded transition-colors flex items-center ${isChildActive
                                                        ? 'bg-white text-[#46B3E6] font-bold shadow-sm'
                                                        : 'text-white/80 hover:text-white hover:bg-[#5bc2f0]'
                                                        }`}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-50"></span>
                                                    {child.name}
                                                </Link>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>

            <div className="p-4 border-t border-[#3AA0D0]">
                <button
                    onClick={() => alert('설정 메뉴는 준비중입니다.')}
                    className="flex items-center px-4 py-3 text-sm font-medium text-white/90 hover:text-white w-full rounded hover:bg-[#5bc2f0] transition-colors"
                >
                    <Settings className="h-5 w-5 mr-3" />
                    설정
                </button>
            </div>
        </div>
    );
}
