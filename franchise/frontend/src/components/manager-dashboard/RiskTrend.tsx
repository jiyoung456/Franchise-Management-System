'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

const data = [
    { name: 'Mon', risk: 12 },
    { name: 'Tue', risk: 19 },
    { name: 'Wed', risk: 15 },
    { name: 'Thu', risk: 25 },
    { name: 'Fri', risk: 32 },
    { name: 'Sat', risk: 28 },
    { name: 'Sun', risk: 45 },
];

export function RiskTrend() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6 h-full">
                <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Weekly Risk Trend</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900">+24%</span>
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                            <TrendingUp size={12} /> Risks Increasing
                        </span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <Info size={16} />
                </button>
            </div>

            <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            dy={10}
                        />
                        {/* Hiding YAxis for cleaner look as per requs */}
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#111827', fontWeight: 600 }}
                            labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#f43f5e"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
