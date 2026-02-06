'use client';

import { User } from 'lucide-react';

const supervisors = [
    { id: '1', name: 'Kim Min-su', riskyStores: 5, pendingActions: 3, avatarColor: 'bg-blue-100 text-blue-600' },
    { id: '2', name: 'Lee Ji-young', riskyStores: 2, pendingActions: 0, avatarColor: 'bg-green-100 text-green-600' },
    { id: '3', name: 'Park Wei', riskyStores: 8, pendingActions: 12, avatarColor: 'bg-red-100 text-red-600' },
];

export function SupervisorOverview() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Supervisor Workload</h3>

            <div className="space-y-4">
                {supervisors.map((sv) => (
                    <div key={sv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${sv.avatarColor}`}>
                                <span className="font-bold text-sm">{sv.name.split(' ').map(n => n[0]).join('')}</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">{sv.name}</p>
                                <p className="text-xs text-gray-500">Field Supervisor</p>
                            </div>
                        </div>

                        <div className="flex gap-4 text-right">
                            <div>
                                <p className="text-xs text-gray-400">Risky</p>
                                <p className={`text-sm font-bold ${sv.riskyStores > 4 ? 'text-red-600' : 'text-gray-900'}`}>{sv.riskyStores}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Actions</p>
                                <p className="text-sm font-medium text-gray-900">{sv.pendingActions}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-4 py-2 text-sm text-gray-500 font-medium hover:text-gray-900 transition-colors border-t border-gray-100">
                View All Supervisors
            </button>
        </div>
    );
}
