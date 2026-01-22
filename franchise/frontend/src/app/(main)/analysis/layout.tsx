'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'KPI 대시보드', href: '/analysis' },
        { name: '점포 성과 분석 (원인)', href: '/analysis/performance' },
        { name: '지역·SV 비교', href: '/analysis/comparison' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">성과 분석</h2>
                    <p className="text-sm text-gray-500 mt-1">매출, 주문 수, 객단가 등 핵심 지표(KPI) 통합 분석</p>
                </div>
                <div className="flex items-center gap-2">
                    <select className="border border-gray-200 rounded-md text-sm px-2 py-1.5 bg-white">
                        <option>2026년 1월</option>
                    </select>
                </div>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = tab.href === '/analysis'
                            ? pathname === '/analysis'
                            : pathname.startsWith(tab.href);

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`${isActive
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div>{children}</div>
        </div>
    );
}
