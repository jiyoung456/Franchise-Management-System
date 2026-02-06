'use client';

import { AlertCircle, FileText, MoreHorizontal } from 'lucide-react';

interface StoreListProps {
    onOpenReport: (storeId: string) => void;
}

const mockStores = [
    { id: '1', name: 'Gangnam Station Central', risk: 'High', supervisor: 'Kim Min-su', recommendation: 'Check Supplier A delivery' },
    { id: '2', name: 'Seongsu Main', risk: 'Medium', supervisor: 'Lee Ji-young', recommendation: 'Staff training required' },
    { id: '3', name: 'Hongdae Entrance', risk: 'Critical', supervisor: 'Park Wei', recommendation: 'Immediate hygiene audit' },
    { id: '4', name: 'Yeouido Finance', risk: 'Low', supervisor: 'Kim Min-su', recommendation: 'Monitor sales dip' },
    { id: '5', name: 'Itaewon Global', risk: 'Medium', supervisor: 'Sarah Choi', recommendation: 'Review inventory logs' },
];

export function StoreList({ onOpenReport }: StoreListProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Stores Needing Action</h2>
                <div className="flex gap-2">
                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">5 pending</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Store Name</th>
                            <th className="px-6 py-3">Risk Level</th>
                            <th className="px-6 py-3">Assigned Supervisor</th>
                            <th className="px-6 py-3">AI Recommendation</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {mockStores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 font-medium text-gray-900">{store.name}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                    ${store.risk === 'Critical' ? 'bg-red-100 text-red-700' :
                                            store.risk === 'High' ? 'bg-orange-100 text-orange-700' :
                                                store.risk === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'}`}>
                                        {store.risk === 'Critical' && <AlertCircle size={12} />}
                                        {store.risk}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{store.supervisor}</td>
                                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{store.recommendation}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onOpenReport(store.id)}
                                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded transition-colors"
                                            title="View Report"
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded transition-colors">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
