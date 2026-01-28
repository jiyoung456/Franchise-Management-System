'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ActionEffectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    // Mock Data
    const actionData = {
        title: '위생 점검 재이행',
        store: '강남점',
        relatedEvent: '이벤트11',
        type: '방문',
        assignee: '김슈퍼',
        metric: '위생점수',
        executionDate: '2026-01-15'
    };

    // Graph data - 2 weeks before and after
    const graphData = [
        { day: 'D-14', before: 72, after: null },
        { day: 'D-12', before: 73, after: null },
        { day: 'D-10', before: 71, after: null },
        { day: 'D-8', before: 74, after: null },
        { day: 'D-6', before: 72, after: null },
        { day: 'D-4', before: 73, after: null },
        { day: 'D-2', before: 71, after: null },
        { day: 'D-Day', before: 72, after: 72 },
        { day: 'D+2', before: null, after: 75 },
        { day: 'D+4', before: null, after: 78 },
        { day: 'D+6', before: null, after: 82 },
        { day: 'D+8', before: null, after: 85 },
        { day: 'D+10', before: null, after: 87 },
        { day: 'D+12', before: null, after: 88 },
        { day: 'D+14', before: null, after: 89 },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-gray-300 pb-4">
                <Link href={`/actions/${id}`} className="hover:bg-gray-100 p-1 rounded">
                    <ArrowLeft className="w-6 h-6 text-gray-500" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">조치 효과 분석</h1>
            </div>

            {/* Summary Table */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">1. 조치 내용 요약</h2>
                </div>
                <div className="border-t border-b border-gray-300">
                    <table className="w-full text-sm text-left border-collapse">
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200 w-32">제목</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.title}</td>
                                <td className="p-3 bg-gray-50 border-r border-gray-200"></td>
                                <td className="p-3"></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">대상 점포</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.store}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200 w-32">연관 이벤트</th>
                                <td className="p-3 text-gray-900">{actionData.relatedEvent}</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">조치 유형</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.type}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">담당자</th>
                                <td className="p-3 text-gray-900">{actionData.assignee}</td>
                            </tr>
                            <tr>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">목표 지표</th>
                                <td className="p-3 text-gray-900 border-r border-gray-200">{actionData.metric}</td>
                                <th className="bg-gray-50 p-3 font-bold text-gray-700 border-r border-gray-200">조치 시행일</th>
                                <td className="p-3 text-gray-900">{actionData.executionDate}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Effect Graph Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-800">2. 조치 효과</h2>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
                    <div style={{ width: '100%', height: '400px' }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                            <LineChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <defs>
                                    <linearGradient id="colorBefore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAfter" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="day"
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    label={{ value: '2주 기간', position: 'insideBottom', offset: -10, style: { fill: '#374151', fontWeight: 'bold' } }}
                                />
                                <YAxis
                                    stroke="#6b7280"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    domain={[60, 100]}
                                    label={{ value: actionData.metric, angle: -90, position: 'insideLeft', style: { fill: '#374151', fontWeight: 'bold' } }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ paddingTop: '20px' }}
                                    iconType="line"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="before"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={{ fill: '#3b82f6', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="조치 전 (2주)"
                                    connectNulls={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="after"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    dot={{ fill: '#ef4444', r: 4 }}
                                    activeDot={{ r: 6 }}
                                    name="조치 후 (2주) - 개선됨"
                                    connectNulls={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
