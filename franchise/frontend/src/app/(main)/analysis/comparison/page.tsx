'use client';

export default function AnalysisComparisonPage() {
    return (
        <div className="space-y-8">
            {/* SV Performance Ranking */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">지역·담당 SV 성과 비교</h3>
                    <select className="text-xs border border-gray-200 rounded px-2 py-1"><option>매출 달성률 순</option></select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">순위</th>
                                <th className="px-6 py-3">담당 SV</th>
                                <th className="px-6 py-3">담당 지역</th>
                                <th className="px-6 py-3">관리 점포</th>
                                <th className="px-6 py-3">평균 매출 달성률</th>
                                <th className="px-6 py-3">평균 QSC</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {[
                                { rank: 1, name: '김관리', region: '서울 강남', count: 15, sales: '105%', qsc: 94 },
                                { rank: 2, name: '이성실', region: '서울 강북', count: 12, sales: '98%', qsc: 88 },
                                { rank: 3, name: '박부산', region: '부산', count: 18, sales: '92%', qsc: 85 },
                            ].map((row) => (
                                <tr key={row.rank} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-bold text-gray-700">{row.rank}</td>
                                    <td className="px-6 py-4 font-medium">{row.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{row.region}</td>
                                    <td className="px-6 py-4 text-gray-500">{row.count}개</td>
                                    <td className="px-6 py-4 text-blue-600 font-bold">{row.sales}</td>
                                    <td className="px-6 py-4">{row.qsc}점</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top/Bottom Stores */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-blue-600 mb-4">🏆 매출 우수 점포 (Top 5)</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="font-medium text-gray-700">{i}. 강남{i}호점</span>
                                <span className="font-bold text-gray-900">₩5{6 - i},000,000</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-red-600 mb-4">🚨 집중 케어 필요 점포 (Bottom 5)</h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="font-medium text-gray-700">{i}. 지방{i}호점</span>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900">₩1{i},000,000</div>
                                    <div className="text-xs text-red-500">-1{i}% vs 전월</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
