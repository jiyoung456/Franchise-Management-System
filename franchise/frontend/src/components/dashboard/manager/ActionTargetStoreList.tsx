import { AlertCircle, ArrowUpRight, FileText, ChevronRight } from 'lucide-react';
import { Store } from '@/types';

// Fallback Mock Data for UI robustness
const MOCK_TARGET_STORES = [
    {
        id: '1',
        name: 'Gangnam Station Main',
        risk: 'HIGH',
        reason: 'Hygiene Score < 80 (2wks)',
        sv: 'Kim Min-su',
        recommendation: 'Emergency Inspection',
    },
    {
        id: '2',
        name: 'Seocho Branch',
        risk: 'HIGH',
        reason: 'Sales Drop (-15% YoY)',
        sv: 'Lee Ji-won',
        recommendation: 'Sales Consulting',
    },
    {
        id: '3',
        name: 'Yeoksam Delivery',
        risk: 'MEDIUM',
        reason: 'High Customer Complaints',
        sv: 'Park Sung-hoon',
        recommendation: 'CS Training',
    },
    {
        id: '4',
        name: 'Sinnonhyeon',
        risk: 'MEDIUM',
        reason: 'Equipment Maintenance',
        sv: 'Kim Min-su',
        recommendation: 'Facility Check',
    },
    {
        id: '5',
        name: 'Banpo Central',
        risk: 'LOW',
        reason: 'Staff Turnover High',
        sv: 'Choi Woo-jin',
        recommendation: 'Hiring Support',
    }
];

interface ActionTargetStoreListProps {
    stores?: Store[];
    onViewReport: (storeId: string) => void;
}

export function ActionTargetStoreList({ stores, onViewReport }: ActionTargetStoreListProps) {
    // Use mapped real stores if available, otherwise use MOCK_TARGET_STORES to ensure UI is visible
    const displayData = (stores && stores.length > 0)
        ? stores.map(s => ({
            id: String(s.id),
            name: s.name,
            risk: (s as any).state || 'MEDIUM',
            reason: 'AI Analysis Pending...',
            sv: s.supervisor,
            recommendation: 'Review Required'
        }))
        : MOCK_TARGET_STORES;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Stores Requiring Action</h3>
                        <p className="text-xs text-slate-500">AI identified {displayData.length} stores needing attention</p>
                    </div>
                </div>
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                    View All
                </button>
            </div>

            <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 text-xs text-slate-500 uppercase font-bold border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Store Name / Risk</th>
                            <th className="px-6 py-4">AI Reason</th>
                            <th className="px-6 py-4">Supervisor</th>
                            <th className="px-6 py-4">AI Recommendation</th>
                            <th className="px-6 py-4 text-right">Decision</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {displayData.map((store) => (
                            <tr key={store.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="font-bold text-slate-900 text-sm">{store.name}</span>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold border w-fit tracking-wide
                                            ${store.risk === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                                                store.risk === 'MEDIUM' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    'bg-green-50 text-green-600 border-green-100'}`}>
                                            {store.risk} RISK
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 max-w-[240px]">
                                    <span className="text-sm text-slate-700 font-medium block leading-snug" title={store.reason}>
                                        {store.reason}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-600 font-bold border border-slate-200">
                                            {store.sv?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{store.sv}</span>
                                            <span className="text-[10px] text-slate-400">Team A</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 w-fit shadow-sm">
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                        <span className="text-xs font-bold">{store.recommendation}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => onViewReport(store.id)}
                                            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Report">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md shadow-slate-200 flex items-center gap-2">
                                            Take Action
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/30 text-center">
                <button className="text-xs text-slate-500 font-bold hover:text-blue-600 flex items-center justify-center gap-1 mx-auto py-2">
                    Show 10 more stores <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}
