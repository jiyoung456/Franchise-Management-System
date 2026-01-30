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
        const loadData = async () => {
            const user = await AuthService.getCurrentUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // 1. Fetch Real Store List for this User
            // Using the 'test' endpoint found in QscStoreController because SvStoreQscStatusController is broken.
            const myStores = await QscService.getStoresBySupervisor(user.id);

            // 2. Fetch Latest QSC Status for each store
            // We can use getDashboardStats or manual calls. 
            // getDashboardStats takes a list of stores (with id property) and returns inspections.
            const storesForStats = myStores.map((s: any) => ({ id: s.storeId, name: s.storeName, region: s.regionCode }));
            const latestInspections = await QscService.getDashboardStats(storesForStats);

            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            // 3. Merge Data
            const storesWithStatus = myStores.map((store: any) => {
                const latest = latestInspections.find(i => i.storeId === store.storeId.toString());

                // Determine if inspected this month
                const isInspectedThisMonth = latest && latest.date.startsWith(currentMonth);

                let status = '미점검';
                if (isInspectedThisMonth && latest) {
                    if (['S', 'A'].includes(latest.grade)) status = '양호';
                    else if (latest.grade === 'B') status = '점검요망';
                    else status = '위험';
                } else if (latest) {
                    // Has inspection but not this month -> Still show last grade?
                    // Usually Status reflects "Current Month Status". If not inspected this month, it is "Not Inspected".
                    // But we want to show Last Grade.
                    // The 'status' column in UI usually means "Action Required?".
                }

                return {
                    storeId: store.storeId,
                    storeName: store.storeName,
                    region: store.regionCode || '-',
                    address: store.regionCode || '-',
                    status: status,
                    lastGrade: latest ? latest.grade : '-',
                    lastDate: latest ? latest.date : '-',
                    score: latest ? latest.score : 0,
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
