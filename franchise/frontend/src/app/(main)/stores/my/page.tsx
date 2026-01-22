'use client';

import { MOCK_STORES } from '@/lib/mock/mockData';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { ScoreBar } from '@/components/common/ScoreBar';

export default function MyStoresPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    const filteredStores = MOCK_STORES.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            store.regionCode.includes(searchTerm);
        const matchesStatus = filterStatus === 'ALL' || store.currentState === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Calc days since open
    const getDaysOpen = (dateStr: string) => {
        const start = new Date(dateStr).getTime();
        const now = new Date().getTime();
        return Math.floor((now - start) / (1000 * 3600 * 24));
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-4 w-fit px-2">내 담당 점포 목록</h1>

            {/* Search & Filter Bar */}
            <div className="flex border border-gray-300 bg-white shadow-sm">
                <div className="flex-1 flex items-center px-4 py-4 border-r border-gray-300">
                    <span className="font-bold text-gray-700 w-24 text-center">점포 검색</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="점포명 또는 지역을 입력하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
                <div className="flex-1 flex items-center px-4 py-4">
                    <span className="font-bold text-gray-700 w-24 text-center">점포 필터</span>
                    <div className="relative flex-1 max-w-xs">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        >
                            <option value="ALL">전체 점포</option>
                            <option value="NORMAL">정상</option>
                            <option value="WATCHLIST">관찰필요</option>
                            <option value="RISK">위험</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List Table */}
            <div className="border-t border-gray-400 mt-6">
                {/* Table Body */}
                <div className="bg-white space-y-4 py-4">
                    {filteredStores.map(store => (
                        <div key={store.id} className="border border-gray-300 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            {/* Left Info */}
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-gray-900 text-lg">
                                    {store.name}
                                    <span className="text-sm font-normal text-gray-500 ml-2">{store.regionCode}</span>
                                </span>
                                <div className="text-sm text-gray-600">
                                    {store.openedAt?.split('T')[0]} <span className="text-gray-400">({getDaysOpen(store.openedAt || new Date().toISOString())}일)</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    {store.ownerName} <span className="text-gray-400">, 010-1234-5678</span>
                                </div>
                            </div>

                            {/* Right Info: Risk & Button */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-700 w-12 text-right">위험도</span>
                                    <div className="w-32">
                                        <ScoreBar value={store.currentStateScore} />
                                    </div>
                                    <span className="font-bold text-gray-500 w-8 text-right">{store.currentStateScore}</span>
                                </div>

                                <button
                                    onClick={() => router.push(`/stores/${store.id}?tab=qsc`)}
                                    className="px-4 py-2 border border-gray-400 rounded bg-white text-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors"
                                >
                                    상세
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredStores.length === 0 && (
                    <div className="text-center py-20 text-gray-400 border-t border-gray-200">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
