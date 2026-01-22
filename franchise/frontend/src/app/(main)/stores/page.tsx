'use client';

import { useRouter } from 'next/navigation';
import { Plus, Search, Filter, MapPin, User, Calendar, AlertTriangle, ChevronRight, Store as StoreIcon, Activity, Clock, MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { StoreService } from '@/services/storeService';
import { AuthService } from '@/services/authService';
import { MOCK_STORES } from '@/lib/mock/mockData';
import { MOCK_EVENTS } from '@/lib/mock/mockEventData'; // Import Mock Events
import { StatusBadge } from '@/components/common/StatusBadge';
import { ScoreBar } from '@/components/common/ScoreBar';

export default function StoreListPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [stores, setStores] = useState(MOCK_STORES);
    const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'MANAGER' | null>(null);
    const [filteredStores, setFilteredStores] = useState(MOCK_STORES);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [regionFilter, setRegionFilter] = useState('ALL');
    const [sortOption, setSortOption] = useState('REVENUE_DESC');

    useEffect(() => {
        AuthService.init();
        const user = AuthService.getCurrentUser();

        if (user) {
            setRole(user.role);
            if (user.role === 'SUPERVISOR') {
                const myStores = StoreService.getStoresBySv(user.id);
                setStores(myStores);
                setFilteredStores(myStores);
            } else {
                const allStores = StoreService.getStores();
                setStores(allStores);
                setFilteredStores(allStores);
            }
        }
    }, []);

    useEffect(() => {
        let result = [...stores];

        if (searchTerm) {
            result = result.filter(store =>
                store.name.includes(searchTerm) ||
                store.name.includes(searchTerm) ||
                (store.currentSupervisorId || '').includes(searchTerm) ||
                store.regionCode.includes(searchTerm)
            );
        }

        if (statusFilter !== 'ALL') {
            result = result.filter(store => store.operationStatus === statusFilter);
        }

        if (regionFilter !== 'ALL') {
            result = result.filter(store => store.regionCode === regionFilter);
        }

        // Sorting Logic
        result.sort((a, b) => {
            const eventCountA = MOCK_EVENTS.filter(e => e.storeId === a.id).length;
            const eventCountB = MOCK_EVENTS.filter(e => e.storeId === b.id).length;

            switch (sortOption) {
                case 'REVENUE_DESC':
                    return (b.monthlyRevenue || 0) - (a.monthlyRevenue || 0);
                case 'REVENUE_ASC':
                    return (a.monthlyRevenue || 0) - (b.monthlyRevenue || 0);
                case 'GROWTH_DESC':
                    return (b.growthRate || 0) - (a.growthRate || 0);
                case 'GROWTH_ASC':
                    return (a.growthRate || 0) - (b.growthRate || 0);
                case 'RISK_DESC': // High Risk Score first (bad)? Or Low? 
                // Usually Risk Sort means "Most Risky First". 
                // In our app, High Score = Good (Green)? 
                // Wait, `lifecycleScore`: 95 is Green. 45 is Risk.
                // So "Risk Order" means Lowest Score First (Bad first).
                // Let's assume User wants "Risky Stores First" = Ascending Score.
                case 'RISK_DESC':
                    return a.currentStateScore - b.currentStateScore;
                case 'RISK_ASC':
                    return b.currentStateScore - a.currentStateScore;
                case 'VISIT_ASC':
                    // if (a.lastCheckDate === '-') return 1;
                    // if (b.lastCheckDate === '-') return -1;
                    return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                case 'EVENT_DESC': // Most New Events First
                    return eventCountB - eventCountA;
                default:
                    return 0;
            }
        });

        setFilteredStores(result);
    }, [searchTerm, statusFilter, regionFilter, stores, sortOption]);

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
                        <option value="REVENUE_DESC">매출 높은 순</option>
                        <option value="REVENUE_ASC">매출 낮은 순</option>
                        <option value="GROWTH_DESC">성장률 높은 순</option>
                        <option value="GROWTH_ASC">성장률 낮은 순</option>
                        <option value="RISK_DESC">위험도 높은 순</option>
                        <option value="RISK_ASC">위험도 낮은 순</option>
                        <option value="VISIT_ASC">방문 오래된 순</option>
                        <option value="EVENT_DESC">신규 이벤트 순</option>
                    </select>

                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[120px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">상태 (전체)</option>
                        <option value="OPEN">운영중</option>
                        {/* <option value="PRE_OPEN">오픈예정</option> */}
                        <option value="CLOSED_TEMPORARY">휴업</option>
                        <option value="CLOSED">폐업</option>
                    </select>

                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 min-w-[140px]"
                        value={regionFilter}
                        onChange={(e) => setRegionFilter(e.target.value)}
                    >
                        <option value="ALL">지역 (전체)</option>
                        <option value="서울/경기">서울/경기</option>
                        {/* Add more values if they match regionCode EXACTLY. If regionCode is code (e.g. 02), we need mapping. Mocks use "서울/경기" so it's fine. */}
                        <option value="부산/경남">부산/경남</option>
                        <option value="대구/경북">대구/경북</option>
                        <option value="광주/전라">광주/전라</option>
                        <option value="대전/충청">대전/충청</option>
                        <option value="제주">제주</option>
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
                <div className="col-span-2">점포명</div>
                <div className="col-span-1">지역</div>
                <div className="col-span-3">오픈일 (운영기간)</div>
                <div className="col-span-2">점주 정보</div>
                <div className="col-span-2">위험도</div>
                <div className="col-span-1 text-right">상세</div>
            </div>

            {/* List Body */}
            <div className="divide-y divide-gray-100">
                {filteredStores.map((store) => {
                    // Calculate Operation Duration
                    const openDate = new Date(store.openedAt || store.openPlannedAt || new Date());
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - openDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const years = Math.floor(diffDays / 365);
                    const months = Math.floor((diffDays % 365) / 30);
                    const durationStr = years > 0 ? `${years}년 ${months}개월` : `${months}개월`;

                    return (
                        <div
                            key={store.id}
                            className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-gray-50/80 transition-colors"
                        >
                            {/* ID */}
                            <div className="md:col-span-1">
                                <span className="text-gray-500 font-mono text-xs">#{store.id}</span>
                            </div>

                            {/* Store Name */}
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                    {store.name}
                                </h3>
                                <div className="flex gap-1 mt-1">
                                    <StatusBadge
                                        status={store.operationStatus === 'OPEN' ? '운영중' : store.operationStatus === 'CLOSED_TEMPORARY' ? '휴업' : '폐업'}
                                        type={store.operationStatus === 'OPEN' ? 'success' : 'neutral'}
                                        className="text-[10px] px-1.5 py-0.5"
                                    />
                                </div>
                            </div>

                            {/* Region */}
                            <div className="md:col-span-1">
                                <span className="text-sm text-gray-600">{store.regionCode}</span>
                            </div>

                            {/* Open Date / Duration */}
                            <div className="md:col-span-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900">{store.openedAt ? store.openedAt.split('T')[0] : '미정'}</span>
                                    <span className="text-xs text-gray-500">({durationStr} 운영중)</span>
                                </div>
                            </div>

                            {/* Owner Info */}
                            <div className="md:col-span-2">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-900">{store.ownerName}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 pl-5">{store.ownerPhone}</span>
                                </div>
                            </div>

                            {/* Risk Score (Bar Graph) */}
                            <div className="md:col-span-2 pr-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-500">리스크 점수</span>
                                        <span className={`font-bold ${store.currentStateScore >= 80 ? 'text-blue-600' : 'text-red-600'}`}>
                                            {store.currentStateScore}점
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${store.currentStateScore >= 80 ? 'bg-blue-500' :
                                                store.currentStateScore >= 60 ? 'bg-yellow-400' : 'bg-red-500'
                                                }`}
                                            style={{ width: `${store.currentStateScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Button */}
                            <div className="md:col-span-1 flex justify-end">
                                <button
                                    onClick={() => router.push(`/stores/${store.id}`)}
                                    className="px-3 py-1.5 border border-gray-200 hover:border-blue-500 hover:text-blue-600 rounded-md text-xs font-bold transition-colors bg-white hover:bg-blue-50"
                                >
                                    상세보기
                                </button>
                            </div>
                        </div>
                    );
                })}

                {filteredStores.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">조회된 점포가 없습니다</h3>
                        <p className="text-gray-500 mt-2">
                            {role === 'SUPERVISOR'
                                ? '담당하고 계신 점포 정보가 없습니다.'
                                : '검색 조건에 맞는 점포가 없습니다.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
