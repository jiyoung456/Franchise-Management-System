'use client';

import { useState, useEffect } from 'react';
import { TrendingDown, Search } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { StoreService } from '@/services/storeService';
import { QscService } from '@/services/qscService';
import { useRouter } from 'next/navigation';
import { Store } from '@/types';
import { StorageService } from '@/lib/storage';

export default function QscMyStoresPage() {
    const router = useRouter();
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (!user) {
            setLoading(false);
            return;
        }

        // Use StorageService to get stores logic (mock)
        const loadStores = async () => {
            // In mock, getStoresBySv returns Promise or direct array if I look at my previous overrides
            // But StorageService.getStoresBySv in storage.ts returns Store[] (sync)
            const svStores = StorageService.getStoresBySv(user.id);
            return svStores;
        }

        const loadData = async () => {
            console.log('QSC My Stores: User:', user);
            let myStoresData: any[] = [];
            try {
                myStoresData = await StoreService.getStoresBySv(user.loginId);
                if (!myStoresData || myStoresData.length === 0) {
                    // Fallback to manual ID filter if service fails
                    const { MOCK_STORES } = require('@/lib/mock/mockData');
                    myStoresData = MOCK_STORES.filter((s: any) => [1, 4, 12].includes(s.id));
                }
            } catch (e) {
                console.error('QSC My Stores Error:', e);
                // Fallback catch
                const { MOCK_STORES } = require('@/lib/mock/mockData');
                myStoresData = MOCK_STORES.filter((s: any) => [1, 4, 12].includes(s.id));
            }
            const inspections = QscService.getInspections();
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            const storesWithStatus = myStoresData.map(store => {
                // ... same logic ...
                // Find latest inspection
                const storeInspections = inspections.filter((i: any) => i.storeId === store.id.toString());
                const latestInspection = storeInspections.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

                const isInspectedThisMonth = storeInspections.some((i: any) => i.date.startsWith(currentMonth));

                let status = '미점검';
                if (isInspectedThisMonth && latestInspection) {
                    if (latestInspection.grade === 'S' || latestInspection.grade === 'A') status = '양호';
                    else if (latestInspection.grade === 'B') status = '점검요망';
                    else status = '위험';
                }

                return {
                    storeId: store.id,
                    storeName: store.name,
                    region: store.region,
                    address: store.region,
                    status: status,
                    lastGrade: latestInspection ? latestInspection.grade : '-',
                    lastDate: latestInspection ? latestInspection.date : '-',
                    score: latestInspection ? latestInspection.score : 0,
                    uninspected: !isInspectedThisMonth
                };
            });
            setStores(storesWithStatus);
            setLoading(false);
        };
        loadData();
    }, []);

    const filteredStores = stores.filter(store =>
        store.storeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const uninspectedStores = stores.filter(s => s.uninspected);

    if (loading) return <div className="p-20 text-center">로딩중...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">내 담당 점포 QSC 현황</h1>
                <p className="text-sm text-gray-500 mt-1">담당 점포의 위생 상태와 점검 일정을 관리합니다.</p>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center shadow-sm">
                    <span className="font-bold text-gray-700 mr-4 whitespace-nowrap">점포 검색</span>
                    <input
                        type="text"
                        placeholder="점포명 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-none rounded px-3 py-1 text-sm focus:ring-0 outline-none"
                    />
                    <Search className="w-5 h-5 text-gray-400 ml-2" />
                </div>
                {/* Filter - Mock UI for now */}
                <div className="w-1/3 bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center shadow-sm justify-between cursor-pointer hover:bg-gray-50">
                    <span className="font-bold text-gray-700">전체 보기</span>
                    <TrendingDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Store List - SHOW ALL */}
                <div className="lg:col-span-2 space-y-4">
                    {filteredStores.length > 0 ? (
                        filteredStores.map((store) => (
                            <div key={store.storeId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-gray-900">{store.storeName}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${store.status === '양호' ? 'bg-green-100 text-green-700' :
                                        store.status === '점검요망' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {store.status}
                                    </span>
                                    <div className="text-sm text-gray-500 border-l border-gray-300 pl-4 flex gap-4">
                                        <span>최근 등급: <b className="text-gray-800">{store.lastGrade}</b></span>
                                        <span>최근 점검: {store.lastDate}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/qsc/history/${store.storeId}`)}
                                    className="px-4 py-2 border border-gray-300 rounded text-sm font-bold text-gray-700 hover:bg-gray-50"
                                >
                                    상세
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 text-gray-400 bg-white rounded-lg border border-gray-200">
                            점검 완료된 점포가 없습니다.
                        </div>
                    )}
                </div>

                {/* Right: Uninspected Widget */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">이번달 미점검 점포</h3>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{uninspectedStores.length}</span>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {uninspectedStores.map(store => (
                            <div key={store.storeId} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="font-bold text-gray-900">{store.storeName}</p>
                                    <p className="text-xs text-gray-500">{store.address}</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/qsc/inspection/new?storeId=${store.storeId}`)} // Direct to new inspection with storeId
                                    className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
                                >
                                    점검
                                </button>
                            </div>
                        ))}
                        {uninspectedStores.length === 0 && (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                모든 점포 점검 완료!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
