'use client';

import { useState, useMemo, useEffect } from 'react';
import api from '@/lib/api';
import { Search, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// API Response Types
interface RiskFactor {
    label: string;
    count?: number;
}

interface RiskItem {
    storeId: number | string;
    name: string; // API might return 'storeName' or 'name', mapping needed if different
    storeName?: string; // Handling potential naming difference
    supervisor: string;
    region: string;
    riskScore: number;
    riskLevel: 'NORMAL' | 'WATCHLIST' | 'RISK';
    lastInspectionDate: string;
    factors?: RiskFactor[];
}

export default function AiRiskHomePage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    // API State
    // API State
    const [riskData, setRiskData] = useState<RiskItem[]>([]);
    const [apiDistribution, setApiDistribution] = useState<any[]>([]);
    const [apiTopFactors, setApiTopFactors] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/risk');

                console.log('API Response:', response.data);

                const dataObj = response.data;

                // 1. Process Stores
                let storesRaw: any[] = [];
                if (dataObj && Array.isArray(dataObj.stores)) {
                    storesRaw = dataObj.stores;
                } else if (Array.isArray(dataObj)) {
                    storesRaw = dataObj;
                }

                const formattedStores: RiskItem[] = storesRaw.map(item => {
                    const score = item.riskScore ?? 0;

                    // Use API provided status strictly (riskLevel does not exist)
                    const apiStatus = item.status || 'NORMAL';

                    // Normalize string to handle case sensitivity (e.g. "Watchlist " -> "WATCHLIST")
                    let rawLevel = String(apiStatus).toUpperCase().trim();

                    let level = 'NORMAL';
                    if (rawLevel === 'RISK') level = 'RISK';
                    else if (rawLevel === 'WATCHLIST') level = 'WATCHLIST';
                    else level = 'NORMAL';

                    return {
                        ...item,
                        name: item.storeName || item.name || 'Unknown Store',
                        storeName: item.storeName || item.name || 'Unknown Store',
                        storeId: item.storeId || item.id,
                        supervisor: item.supervisorName || item.supervisor || item.svName || item.manager || item.sv_name || '-',
                        factors: item.factors || [],
                        riskScore: score,
                        riskLevel: level as 'RISK' | 'WATCHLIST' | 'NORMAL'
                    };
                }).sort((a, b) => b.riskScore - a.riskScore); // SORT HERE: High score first

                setRiskData(formattedStores);

                // 2. Process Distribution
                if (dataObj.distribution) {
                    const dist = dataObj.distribution;
                    const chartData = [
                        { name: '정상', value: dist.normal || dist.NORMAL || 0, color: '#22c55e' },
                        { name: '주의', value: dist.watchlist || dist.WATCHLIST || 0, color: '#f97316' },
                        { name: '위험', value: dist.risk || dist.RISK || 0, color: '#ef4444' }
                    ];
                    setApiDistribution(chartData);
                }

                // 3. Process Top Factors
                if (Array.isArray(dataObj.top5Factors)) {
                    setApiTopFactors(dataObj.top5Factors);
                }

                setError(null);
            } catch (err) {
                console.error('Failed to fetch risk data:', err);
                setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 1. Data Aggregation & Sorting
    const combinedData = useMemo(() => {
        // Priority for sorting: RISK > WATCHLIST > NORMAL
        const priority: Record<string, number> = { RISK: 3, WATCHLIST: 2, NORMAL: 1 };

        return [...riskData].sort((a, b) => {
            const pA = priority[a.riskLevel] || 0;
            const pB = priority[b.riskLevel] || 0;

            if (pA !== pB) {
                return pB - pA; // Higher priority first
            }
            // If levels are same, sort by score descending
            return b.riskScore - a.riskScore;
        });
    }, [riskData]);



    // Filter State
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [selectedRegion, setSelectedRegion] = useState('ALL');
    const [selectedSupervisor, setSelectedSupervisor] = useState('ALL');

    // Extract unique options for filters
    const { uniqueRegions, uniqueSupervisors } = useMemo(() => {
        const regions = new Set<string>();
        const supervisors = new Set<string>();

        riskData.forEach(item => {
            if (item.region) regions.add(item.region);
            if (item.supervisor && item.supervisor !== '-') supervisors.add(item.supervisor);
        });

        return {
            uniqueRegions: Array.from(regions).sort(),
            uniqueSupervisors: Array.from(supervisors).sort()
        };
    }, [riskData]);

    const filteredData = useMemo(() => {
        let result = combinedData;

        // 1. Search Term (Name Only)
        if (searchTerm) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 2. Status Filter
        if (selectedStatus !== 'ALL') {
            result = result.filter(item => item.riskLevel === selectedStatus);
        }

        // 3. Region Filter
        if (selectedRegion !== 'ALL') {
            result = result.filter(item => item.region === selectedRegion);
        }

        // 4. Supervisor Filter (Dropdown)
        if (selectedSupervisor !== 'ALL') {
            result = result.filter(item => item.supervisor === selectedSupervisor);
        }

        return result;
    }, [combinedData, searchTerm, selectedStatus, selectedRegion, selectedSupervisor]);

    // Reset Filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedStatus('ALL');
        setSelectedRegion('ALL');
        setSelectedSupervisor('ALL');
        setCurrentPage(1);
    };

    // use API data
    const distribution = apiDistribution.length > 0 ? apiDistribution : [
        { name: '정상', value: 0, color: '#22c55e' },
        { name: '주의', value: 0, color: '#f97316' },
        { name: '위험', value: 0, color: '#ef4444' }
    ];

    const topFactors = apiTopFactors;

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset page when search/filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedStatus, selectedRegion, selectedSupervisor]);

    // Pagination Logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Get current page data
    const currentData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage]);

    // Page Group Logic (for showing 1-10, 11-20)
    const pageGroupSize = 10;
    const currentGroup = Math.ceil(currentPage / pageGroupSize);
    const startPage = (currentGroup - 1) * pageGroupSize + 1;
    const endPage = Math.min(startPage + pageGroupSize - 1, totalPages);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePrevGroup = () => {
        if (startPage > 1) {
            setCurrentPage(startPage - 1);
        }
    };

    const handleNextGroup = () => {
        if (endPage < totalPages) {
            setCurrentPage(endPage + 1);
        }
    };

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'RISK': return <span className="text-red-600 font-bold">위험</span>;
            case 'WATCHLIST': return <span className="text-orange-500 font-bold">주의</span>;
            case 'NORMAL': return <span className="text-green-600 font-bold">정상</span>;
            default: return <span className="text-gray-500">{status}</span>;
        }
    };

    // Helper for Region Name Mapping
    const getRegionName = (code: string) => {
        if (!code) return '-';
        // Handle common patterns like SEOUL_01 -> 서울_01 or just replace prefix
        const prefixMap: Record<string, string> = {
            'SEOUL': '서울',
            'GYEONGGI': '경기',
            'INCHEON': '인천',
            'GANGWON': '강원',
            'DAEJEON': '대전',
            'SEJONG': '세종',
            'CHUNGNAM': '충남',
            'CHUNGBUK': '충북',
            'DAEGU': '대구',
            'GYEONGBUK': '경북',
            'BUSAN': '부산',
            'ULSAN': '울산',
            'GYEONGNAM': '경남',
            'GWANGJU': '광주',
            'JEONNAM': '전남',
            'JEONBUK': '전북',
            'JEJU': '제주'
        };

        // Split by underscore or just try to replace known prefixes
        // Assuming format like "SEOUL_01"
        const parts = code.split('_');
        if (parts.length > 0) {
            const korPrefix = prefixMap[parts[0].toUpperCase()];
            if (korPrefix) {
                return code.replace(parts[0], korPrefix);
            }
        }
        return code;
    };

    return (
        <div className="space-y-6 pb-20 mx-auto w-full">
            {/* Header */}
            <div className="mb-2">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">위험 현황 (AI Insight)</h1>
                <p className="text-sm text-gray-500 mt-1">AI가 분석한 가맹점별 리스크 등급과 주요 위험 요인을 진단합니다.</p>
            </div>

            {/* Top Section: Statistics */}
            <div className="h-[300px] mb-6">
                {/* 1. Bar Chart (Risk Distribution) - Full Width */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">전체 가맹점 리스크 분포</h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 14, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={80}>
                                    {distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-2 rounded-sm border border-gray-300 shadow-sm flex items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                    {/* Label */}
                    <div className="bg-gray-100 px-3 py-1.5 font-bold text-gray-700 rounded text-sm mr-1">
                        조건
                    </div>

                    {/* Status Select */}
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500 min-w-[120px]"
                    >
                        <option value="ALL">상태 (전체)</option>
                        <option value="RISK">위험</option>
                        <option value="WATCHLIST">주의</option>
                        <option value="NORMAL">정상</option>
                    </select>

                    {/* Region Select */}
                    <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500 min-w-[140px]"
                    >
                        <option value="ALL">권역 (전체)</option>
                        {uniqueRegions.map(region => (
                            <option key={region} value={region}>{getRegionName(region)}</option>
                        ))}
                    </select>

                    {/* Supervisor Select */}
                    <select
                        value={selectedSupervisor}
                        onChange={(e) => setSelectedSupervisor(e.target.value)}
                        className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-indigo-500 min-w-[140px]"
                    >
                        <option value="ALL">담당SV (전체)</option>
                        {uniqueSupervisors.map(sv => (
                            <option key={sv} value={sv}>{sv}</option>
                        ))}
                    </select>
                </div>

                {/* Reset Button */}
                <button
                    onClick={resetFilters}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded transition-colors"
                    title="필터 초기화"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74-2.74L3 12" />
                    </svg>
                </button>
            </div>

            {/* Middle Section: Search */}
            <div className="bg-white p-1 rounded-sm border border-gray-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center flex-1">
                    <div className="bg-gray-100 px-4 py-3 font-bold text-gray-700 mr-2 border-r border-gray-300">
                        검색
                    </div>
                    <div className="flex-1 relative max-w-md">
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
                <div className="pr-4 text-sm text-gray-500 font-medium">
                    총 <span className="text-indigo-600 font-bold">{filteredData.length}</span>개 점포
                </div>
            </div>

            {/* Bottom Section: Store List Table */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-600 font-bold border-b border-gray-300">
                            <tr>
                                <th className="px-6 py-4 border-r border-gray-200">점포명</th>
                                <th className="px-6 py-4 border-r border-gray-200">상태</th>
                                <th className="px-6 py-4 border-r border-gray-200">권역</th>
                                <th className="px-6 py-4 border-r border-gray-200">담당SV</th>
                                <th className="px-6 py-4 w-1/3">위험 점수</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {currentData.map((store) => (
                                <tr
                                    key={store.storeId}
                                    onClick={() => router.push(`/ai-insight/${store.storeId}?storeName=${encodeURIComponent(store.name)}`)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-bold text-gray-900 border-r border-gray-100">{store.name}</td>
                                    <td className="px-6 py-4 border-r border-gray-100">{getStatusBadge(store.riskLevel)}</td>
                                    <td className="px-6 py-4 text-gray-600 border-r border-gray-100">{getRegionName(store.region)}</td>
                                    <td className="px-6 py-4 text-gray-600 border-r border-gray-100">{store.supervisor}</td>
                                    <td className="px-6 py-4">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredData.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        검색된 점포가 없습니다.
                    </div>
                )}

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                    <div className="flex justify-center items-center gap-2 p-6 border-t border-gray-200 bg-gray-50">
                        {/* Prev Group Button */}
                        <button
                            onClick={handlePrevGroup}
                            disabled={startPage === 1}
                            className={`px-3 py-1 rounded border border-gray-300 bg-white text-gray-400 font-bold hover:bg-gray-100 ${startPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            &lt;
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 rounded border font-bold text-sm min-w-[32px] ${currentPage === page
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Group Button */}
                        <button
                            onClick={handleNextGroup}
                            disabled={endPage === totalPages}
                            className={`px-3 py-1 rounded border border-gray-300 bg-white text-gray-400 font-bold hover:bg-gray-100 ${endPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
