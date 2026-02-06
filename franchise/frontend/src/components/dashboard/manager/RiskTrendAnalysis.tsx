import { TrendingDown, TrendingUp, Info } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_TREND_DATA = [
    { name: 'Mon', risk: 12 },
    { name: 'Tue', risk: 15 },
    { name: 'Wed', risk: 18 },
    { name: 'Thu', risk: 14 },
    { name: 'Fri', risk: 10 },
    { name: 'Sat', risk: 8 },
    { name: 'Sun', risk: 8 },
];

export function RiskTrendAnalysis() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                        Risk Trend
                        <Info className="w-3.5 h-3.5 text-slate-300" />
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Weekly Risk Score Movement
                    </p>
                </div>
                <div className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-[11px] font-bold border border-green-100 flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    -12%
                </div>
            </div>

            <div className="flex-1 min-h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_TREND_DATA}>
                        <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                        <YAxis hide />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}
                            itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="risk"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRisk)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Avg Risk Level</span>
                    <span className="font-bold text-slate-800">12.5 (Low)</span>
                </div>
            </div>
        </div>
    );
}
