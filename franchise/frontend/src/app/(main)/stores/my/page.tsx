'use client';

import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ScoreBar } from '@/components/common/ScoreBar';
import { StoreService } from '@/services/storeService';
import { Store, StoreSearchRequest } from '@/types';
import { AuthService } from '@/services/authService';

export default function MyStoresPage() {
    const router = useRouter();
    const [myStores, setMyStores] = useState<Store[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 검색 및 필터 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'SUPERVISOR' | null>(null);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                setLoading(true);
                const user = await AuthService.getCurrentUser();
                
                if (user) {
                    setRole(user.role);

                    // 검색 조건 생성 (서버로 전달)
                    const params: StoreSearchRequest = { limit: 200 }; // 충분한 조회 개수
                    if (searchTerm) params.keyword = searchTerm;
                    if (filterStatus !== 'ALL') params.state = filterStatus as any;

                    let data: Store[] = [];

                    if (user.role === 'SUPERVISOR') {
                        // [슈퍼바이저] 내 담당(또는 부서) 점포 조회 (/api/stores/supervisor)
                        data = await StoreService.getStoresBySv(params);
                    } else {
                        // [팀장/관리자] 내 부서 점포 조회 (/api/stores)
                        // 백엔드에서 로그인한 사용자의 부서(Department)를 기준으로 자동 필터링됩니다.
                        data = await StoreService.getStores(params);
                    }
                    
                    setMyStores(data);
                } else {
                    setMyStores([]);
                }
            } catch (e) {
                console.error('Failed to fetch my stores:', e);
            } finally {
                setLoading(false);
            }
        };

        // Debounce 적용 (선택 사항) 또는 검색 버튼 없이 실시간 조회
        const timer = setTimeout(() => {
            fetchStores();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, filterStatus]); // 검색어, 필터 변경 시 재조회

    if (loading && myStores.length === 0) return <div className="p-12 text-center">Loading...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            <h1 className="text-2xl font-bold text-gray-900 border-b border-gray-300 pb-4 w-fit px-2">
                {role === 'SUPERVISOR' ? '내 담당 점포 목록' : '내 부서 점포 목록'}
            </h1>

            {/* Search & Filter Bar */}
            <div className="flex border border-gray-300 bg-white shadow-sm">
                <div className="flex-1 flex items-center px-4 py-4 border-r border-gray-300">
                    <span className="font-bold text-gray-700 w-24 text-center">점포 검색</span>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={role === 'SUPERVISOR' ? "점포명 또는 지역 입력" : "점포명, 지역, 담당SV 입력"}
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
                    {myStores.map(store => (
                        <div key={store.id} className="border border-gray-300 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                            {/* Left Info */}
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-gray-900 text-lg">
                                    {store.name}
                                    <span className="text-sm font-normal text-gray-500 ml-2">{store.region}</span>
                                </span>
                                <div className="text-sm text-gray-600 flex gap-2">
                                    <span>{store.lastInspectionDate ? `최근 점검: ${store.lastInspectionDate}` : '점검 이력 없음'}</span>
                                    {/* 팀장/관리자인 경우 담당 SV 표시 */}
                                    {role !== 'SUPERVISOR' && store.supervisor && (
                                        <>
                                            <span className="text-gray-300">|</span>
                                            <span>담당: {store.supervisor}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Right Info: Risk & Button */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-700 w-12 text-right">QSC</span>
                                    <div className="w-32">
                                        <ScoreBar value={store.qscScore} />
                                    </div>
                                    <span className="font-bold text-gray-500 w-8 text-right">{store.qscScore}</span>
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

                {myStores.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-400 border-t border-gray-200">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}