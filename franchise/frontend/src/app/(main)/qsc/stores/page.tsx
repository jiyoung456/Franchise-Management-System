'use client';

import { useState, useEffect } from 'react';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { ScoreBar } from '@/components/common/ScoreBar';
import Link from 'next/link';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function QscStoreListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [regionFilter, setRegionFilter] = useState('전체');
    const [sortOption, setSortOption] = useState('gradeDesc'); // gradeDesc, gradeAsc, dateRecent

    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStores = async () => {
            // Simplified: User logic should be here, but for now assuming SV context or fetch all if Admin
            // Checking if we can reuse the logic from StoreList
            // But this page layout is slightly different. Let's just use MOCK_STORES for now but filtered?
            // "qsc 내 담당점포 현황도 똑같은 데이터 뜨도록" -> implies SV context.
            // We should use AuthService to get current user.
            const { AuthService } = require('@/services/authService');
            const { StoreService } = require('@/services/storeService');

            const user = AuthService.getCurrentUser();
            if (user && user.role === 'SUPERVISOR') {
                try {
                    const data = await StoreService.getStoresBySv(user.loginId);
                    setStores(data);
                } catch (e) { console.error(e); }
            } else {
                setStores(MOCK_STORES); // Admin or others see all? Or fetch from StoreService?
            }
            setLoading(false);
        };
        fetchStores();
    }, []);

    // 1. Filter Logic
    const filteredStores = stores.filter(store => {
        const matchesSearch = store.name.includes(searchTerm);
        const matchesRegion = regionFilter === '전체' || store.region === regionFilter;
        // Mock data allows all states for simplicity, or filter by state if needed
        return matchesSearch && matchesRegion;
    });

    // 2. Sort Logic
    const sortedStores = [...filteredStores].sort((a, b) => {
        if (sortOption === 'gradeDesc') {
            return b.qscScore - a.qscScore;
        } else if (sortOption === 'gradeAsc') {
            return a.qscScore - b.qscScore;
        } else if (sortOption === 'dateRecent') {
            const dateA = a.lastInspectionDate ? new Date(a.lastInspectionDate).getTime() : 0;
            const dateB = b.lastInspectionDate ? new Date(b.lastInspectionDate).getTime() : 0;
            return dateB - dateA;
        }
        return 0;
    });

    // Helper to determine Grade based on Score (Mock logic)
    const getGrade = (score: number) => {
        if (score >= 95) return 'S';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        return 'C';
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">QSC 점포 리스트</h2>
                <p className="text-sm text-gray-500 mt-1">
                    전체 가맹점의 QSC 현황을 등급별, 권역별로 상세 조회합니다.
                </p>
            </div>

            {/* Filter & Sort Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="점포명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Region Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 focus:outline-none focus:border-blue-500"
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                        >
                            <option value="전체">권역 전체</option>
                            <option value="서울/경기">서울/경기</option>
                            <option value="부산/경남">부산/경남</option>
                            <option value="대구/경북">대구/경북</option>
                            <option value="광주/전라">광주/전라</option>
                        </select>
                    </div>

                    {/* Sort Option */}
                    <div className="flex items-center gap-2">
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                        <select
                            className="border border-gray-200 rounded-lg text-sm px-3 py-2 bg-gray-50 focus:outline-none focus:border-blue-500 mr-1"
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                        >
                            <option value="gradeDesc">등급 높은 순</option>
                            <option value="gradeAsc">등급 낮은 순 (위험)</option>
                            <option value="dateRecent">최근 점검일 순</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* QSC Store Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">점포명</th>
                                <th className="px-6 py-3">권역</th>
                                <th className="px-6 py-3">담당 SV</th>
                                <th className="px-6 py-3 w-1/4">QSC 점수</th>
                                <th className="px-6 py-3">등급</th>
                                <th className="px-6 py-3">최근 점검일</th>
                                <th className="px-6 py-3 text-right">리포트</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedStores.map((store) => {
                                const grade = getGrade(store.qscScore);
                                return (
                                    <tr key={store.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                                        <td className="px-6 py-4 text-gray-500">{store.region}</td>
                                        <td className="px-6 py-4 text-gray-500">{store.supervisor}</td>
                                        <td className="px-6 py-4">
                                            <ScoreBar value={store.qscScore} showValue />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ring-1 ring-inset ${grade === 'S' || grade === 'A' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                                                grade === 'B' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                                                    'bg-red-50 text-red-700 ring-red-600/10'
                                                }`}>
                                                {grade}등급
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{store.lastInspectionDate || '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/qsc/report/101`}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                                            >
                                                상세 보기
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
