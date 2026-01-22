'use client';

export default function PerformanceAnalysisPage() {
    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                <div className="bg-white p-2 rounded-full text-xl shadow-sm">💡</div>
                <div>
                    <h4 className="font-bold text-blue-800 text-sm">Insight Alert</h4>
                    <p className="text-sm text-blue-700 mt-1">
                        지난주 대비 <strong>토요일 저녁 시간대</strong> 매출이 15% 감소했습니다.
                        주요 원인은 <strong>'세트 메뉴'</strong> 주문 감소로 분석됩니다.
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">주문 수 변화 추이</h3>
                        <select className="text-xs border border-gray-200 rounded px-2 py-1"><option>지난 30일</option></select>
                    </div>
                    <div className="h-[250px] bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        Trend Chart (Line)
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">객단가 변화 추이</h3>
                        <select className="text-xs border border-gray-200 rounded px-2 py-1"><option>지난 30일</option></select>
                    </div>
                    <div className="h-[250px] bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                        Trend Chart (Line)
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">메뉴 카테고리별 판매 실적 (전주 대비)</h3>
                <div className="space-y-6">
                    {[
                        { name: '버거 단품', current: 45, prev: 42, change: '+3%' },
                        { name: '세트 메뉴', current: 28, prev: 43, change: '-15%', warning: true },
                        { name: '사이드', current: 15, prev: 14, change: '+1%' },
                        { name: '음료', current: 12, prev: 11, change: '+1%' },
                    ].map((item) => (
                        <div key={item.name} className="flex items-center gap-4">
                            <div className="w-24 text-sm font-medium text-gray-700">{item.name}</div>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${item.warning ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${item.current}%` }}
                                />
                            </div>
                            <div className="w-32 flex items-center justify-between text-sm">
                                <span className="font-bold">{item.current}%</span>
                                <span className={`text-xs ${item.warning ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                    {item.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
