'use client';

import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, Store as StoreIcon, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StoreService } from '@/services/storeService';
import { AuthService } from '@/services/authService';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Store, StoreSearchRequest } from '@/types';

export default function StoreListPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [stores, setStores] = useState<Store[]>([]);
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);
    const [loading, setLoading] = useState(false);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [sortOption, setSortOption] = useState<string>('QSC_SCORE_DESC');

    const fetchStores = async () => {
        setLoading(true);
        try {
            const user = await AuthService.getCurrentUser();
            const currentRole = user?.role;
            setRole(currentRole || null);

            let data: Store[] = [];
            if (currentRole === 'SUPERVISOR' && user?.loginId) {
                // Use specialized method for SV
                data = await StoreService.getStoresBySv(user.loginId);
                // Apply local filter if search/status exists (since getStoresBySv returns fixed list)
                if (searchTerm) {
                    data = data.filter(s => s.name.includes(searchTerm) || s.region.includes(searchTerm));
                }
                if (statusFilter && statusFilter !== 'ALL') {
                    data = data.filter(s => s.state === statusFilter);
                }
            } else {
                const params: StoreSearchRequest = { limit: 100 };
                if (searchTerm) params.keyword = searchTerm;
                if (statusFilter && statusFilter !== 'ALL') params.state = statusFilter as any;
                if (sortOption) params.sort = sortOption as any;

                data = await StoreService.getStores(params);
            }

            setStores(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        AuthService.init();
        fetchStores();
    }, [searchTerm, statusFilter, sortOption]);

    const handleCreateStore = () => {
        router.push('/stores/new');
    };

    return (
        <div className="space-y-6 pb-20 mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">점포 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">전체 가맹점 목록 및 상세 정보를 조회하고 관리합니다.</p>
                </div>
                {role === 'ADMIN' && (
                    <button
                        onClick={handleCreateStore}
                        className="flex items-center px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm transition-all hover:shadow-md shrink-0"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        신규 점포 등록
                    </button>
                )}
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-600 font-medium mr-2">
                        <Filter className="w-5 h-5" />
                        <span>조건 검색</span>
                    </div>

                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[120px]"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="QSC_SCORE_DESC">QSC 점수 높은순</option>
                        <option value="QSC_SCORE_ASC">QSC 점수 낮은순</option>
                        <option value="INSPECTED_AT_DESC">최근 점검일순</option>
                        <option value="INSPECTED_AT_ASC">오래된 점검일순</option>
                    </select>

                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[120px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">상태 (전체)</option>
                        <option value="NORMAL">정상</option>
                        <option value="WATCHLIST">관찰</option>
                        <option value="RISK">위험</option>
                    </select>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                        placeholder="점포명, 담당 SV 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 text-xs font-semibold text-gray-500 bg-gray-50/50 border-b border-gray-200 uppercase tracking-wider">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">점포명</div>
                <div className="col-span-2">지역</div>
                <div className="col-span-2">담당 SV</div>
                <div className="col-span-2">QSC/상태</div>
                <div className="col-span-2 text-right">상세</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="py-20 text-center text-gray-500">Loading...</div>
                ) : stores.map((store) => (
                    <div
                        key={store.id}
                        className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/80 transition-colors"
                    >
                        {/* ID */}
                        <div className="md:col-span-1">
                            <span className="text-gray-500 font-mono text-xs">#{store.id}</span>
                        </div>

                        {/* Store Name */}
                        <div className="md:col-span-3">
                            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {store.name}
                            </h3>
                            <div className="flex gap-1 mt-1">
                                <StatusBadge
                                    status={store.state === 'NORMAL' ? '정상' : store.state === 'WATCHLIST' ? '관찰' : '위험'}
                                    type={store.state === 'NORMAL' ? 'success' : store.state === 'WATCHLIST' ? 'warning' : 'danger'}
                                    className="text-[10px] px-1.5 py-0.5"
                                />
                            </div>
                        </div>

                        {/* Region */}
                        <div className="md:col-span-2">
                            <span className="text-sm text-gray-600">{store.region}</span>
                        </div>

                        {/* SV */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{store.supervisor}</span>
                            </div>
                        </div>

                        {/* QSC Score */}
                        <div className="md:col-span-2">
                            <div className="flex flex-col gap-1 pr-4">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">QSC</span>
                                    <span className="font-bold text-blue-600">{store.qscScore}점</span>
                                </div>
                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${store.qscScore}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-gray-400">
                                    점검: {store.lastInspectionDate || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Detail Button */}
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                onClick={() => router.push(`/stores/${store.id}`)}
                                className="px-3 py-1.5 border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-md text-xs font-bold transition-colors bg-white hover:bg-blue-50"
                            >
                                상세보기
                            </button>
                        </div>
                    </div>
                ))}

                {!loading && stores.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">조회된 점포가 없습니다</h3>
                        <p className="text-gray-500 mt-2">검색 조건에 맞는 점포가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
