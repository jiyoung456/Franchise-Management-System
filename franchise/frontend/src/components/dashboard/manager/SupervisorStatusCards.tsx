import { AlertCircle, Clock, MoreHorizontal, User } from 'lucide-react';

const MOCK_SV_STATUS = [
    { name: 'Kim Min-su', riskCount: 3, pendingActions: 5, score: 92 },
    { name: 'Lee Ji-won', riskCount: 2, pendingActions: 1, score: 95 },
    { name: 'Park Sung-hoon', riskCount: 1, pendingActions: 0, score: 98 },
    { name: 'Choi Woo-jin', riskCount: 0, pendingActions: 2, score: 88 },
];

export function SupervisorStatusCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {MOCK_SV_STATUS.map((sv, index) => (
                <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden">
                    {/* Top Decor Line */}
                    <div className={`absolute top-0 left-0 w-full h-1 ${sv.riskCount > 0 ? 'bg-red-500' : 'bg-green-500'}`} />

                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600 font-bold flex items-center justify-center transition-colors border border-slate-100">
                                <User className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">{sv.name}</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Assigned: 12 Stores</p>
                            </div>
                        </div>
                        <button className="text-slate-300 hover:text-slate-600 p-1 hover:bg-slate-100 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-red-50/50 p-2.5 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Risk
                            </span>
                            <span className="font-extrabold text-red-700 text-xl">{sv.riskCount}</span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-col items-center justify-center text-center">
                            <span className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Pending
                            </span>
                            <span className="font-extrabold text-slate-700 text-xl">{sv.pendingActions}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
