'use client';

import { useState, useMemo } from 'react';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_RISK_PROFILES } from '@/lib/mock/mockRiskData';
import { Search, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export default function AiRiskHomePage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Data Aggregation
    const combinedData = useMemo(() => {
        return MOCK_STORES.map(store => {
            const profile = MOCK_RISK_PROFILES[store.id];
            return {
                ...store,
                ...profile, // Risk Profile properties overwrite if collision, but usually discrete
                riskScore: profile ? profile.totalRiskScore : 0,
                riskLevel: profile ? profile.riskLevel : 'NORMAL',
            };
        }).sort((a, b) => b.riskScore - a.riskScore); // Default Sort: Risk Score Desc
    }, []);

    const filteredData = useMemo(() => {
        if (!searchTerm) return combinedData;
        return combinedData.filter(item =>
            item.name.includes(searchTerm) ||
            item.currentSupervisorId?.includes(searchTerm)
        );
    }, [combinedData, searchTerm]);

    // 2. Risk Distribution Data (Bar Chart)
    const distribution = useMemo(() => {
        const counts = { RISK: 0, WATCHLIST: 0, NORMAL: 0 };
        combinedData.forEach(p => {
            if (counts[p.riskLevel as keyof typeof counts] !== undefined) {
                counts[p.riskLevel as keyof typeof counts]++;
            }
        });
        return [
            { name: '정상', value: counts.NORMAL, color: '#22c55e' }, // Green-500
            { name: '주의', value: counts.WATCHLIST, color: '#f97316' }, // Orange-500
            { name: '위험', value: counts.RISK, color: '#ef4444' }    // Red-500
        ];
    }, [combinedData]);

    // 3. Top Risk Factors
    const topFactors = useMemo(() => {
        const factorMap = new Map<string, number>();
        MOCK_STORES.forEach(store => {
            const profile = MOCK_RISK_PROFILES[store.id];
            if (profile) {
                profile.factors.forEach(f => {
                    const current = factorMap.get(f.label) || 0;
                    factorMap.set(f.label, current + 1);
                });
            }
        });
        return Array.from(factorMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }, []);

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RISK': return <span className="text-red-600 font-bold">위험</span>;
            case 'WATCHLIST': return <span className="text-orange-500 font-bold">주의</span>;
            case 'NORMAL': return <span className="text-green-600 font-bold">정상</span>;
            default: return <span className="text-gray-500">{status}</span>;
        }
    };

    return (
        <div className="space-y-8 pb-20 mx-auto w-full">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">위험 현황 (AI Insight)</h1>
                <p className="text-sm text-gray-500 mt-1">AI가 분석한 가맹점별 리스크 등급과 주요 위험 요인을 진단합니다.</p>
            </div>

            {/* Top Section: Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[250px]">
                {/* 1. Bar Chart (Risk Distribution) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">전체 가맹점 리스크 분포</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={60}>
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Top 5 Risk Factors */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">전체 점포 주요 위험 요인 TOP 5</h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                        {topFactors.map((factor, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700 truncate mr-2" title={factor.name}>
                                    {idx + 1}. {factor.name}
                                </span>
                                <span className="font-bold text-indigo-600 whitespace-nowrap">{factor.count}건</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Middle Section: Search */}
            <div className="bg-white p-1 rounded-sm border border-gray-300 shadow-sm flex items-center">
                <div className="bg-gray-100 px-4 py-3 font-bold text-gray-700 mr-2 border-r border-gray-300">
                    검색
                </div>
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="점포명을 입력하세요"
                        className="w-full pl-10 pr-4 py-2 text-sm focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bottom Section: Store List Table */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white text-gray-600 font-bold border-b border-gray-300">
                        <tr>
                            <th className="px-6 py-4 border-r border-gray-200">점포명</th>
                            <th className="px-6 py-4 border-r border-gray-200">상태</th>
                            <th className="px-6 py-4 border-r border-gray-200">권역</th>
                            <th className="px-6 py-4 border-r border-gray-200">담당SV</th>
                            <th className="px-6 py-4 border-r border-gray-200 w-1/3">위험 점수</th>
                            <th className="px-6 py-4">최근 점검일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredData.map((store) => (
                            <tr
                                key={store.id}
                                onClick={() => router.push(`/ai-insight/${store.id}`)}
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-100">{store.name}</td>
                                <td className="px-6 py-4 border-r border-gray-100">{getStatusBadge(store.riskLevel)}</td>
                                <td className="px-6 py-4 text-gray-600 border-r border-gray-100">{store.regionCode}</td>
                                <td className="px-6 py-4 text-gray-600 border-r border-gray-100">{store.currentSupervisorId}</td>
                                <td className="px-6 py-4 border-r border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${store.riskLevel === 'RISK' ? 'bg-red-500' :
                                                    store.riskLevel === 'WATCHLIST' ? 'bg-orange-400' : 'bg-green-500'
                                                    }`}
                                                style={{ width: `${store.riskScore}%` }}
                                            />
                                        </div>
                                        <span className={`font-bold w-12 text-right ${store.riskLevel === 'RISK' ? 'text-red-600' :
                                            store.riskLevel === 'WATCHLIST' ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                            {store.riskScore}점
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{store.updatedAt?.split('T')[0] || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredData.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        검색된 점포가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
