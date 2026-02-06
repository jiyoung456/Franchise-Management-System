'use client';

import { X } from 'lucide-react';

interface ActionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string | null;
}

export function ActionDrawer({ isOpen, onClose, storeId }: ActionDrawerProps) {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-[600px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 flex flex-col font-sans">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Store Analysis Report</h2>
                        <p className="text-sm text-gray-500 font-medium">Gangnam Station Central (ID: {storeId || 'ST-001'})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto space-y-8">

                    {/* Section 1: KPI Snapshot */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
                            <p className="text-xs text-red-600 font-bold uppercase tracking-wide">Risk Score</p>
                            <p className="text-3xl font-extrabold text-red-700 mt-1">85<span className="text-sm text-red-500 font-medium">/100</span></p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Hygiene</p>
                            <p className="text-3xl font-extrabold text-gray-900 mt-1">72<span className="text-sm text-gray-400 font-medium">%</span></p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Sales</p>
                            <p className="text-3xl font-extrabold text-gray-900 mt-1">98<span className="text-sm text-gray-400 font-medium">%</span></p>
                        </div>
                    </div>

                    {/* Section 2: AI Analysis */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            AI Root Cause Analysis
                        </h3>
                        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 text-sm leading-relaxed text-gray-700">
                            <p className="mb-2"><strong className="text-blue-900">Primary Issue:</strong> Recurring hygiene failure in "Food Storage" zone.</p>
                            <p><strong className="text-blue-900">Pattern:</strong> Correlates with evening shift (18:00 - 22:00) on weekends. Supplier 'FreshCo' delivery logs show temperature variance on arrival.</p>
                        </div>
                    </div>

                    {/* Section 3: Recommended Actions */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-600"></span>
                            Recommended Actions
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-sm cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Schedule Emergency Audit</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Assign to Supervisor Kim Min-su for tomorrow morning.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors shadow-sm cursor-pointer">
                                <input type="checkbox" className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">Request Supplier Explanation</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Send auto-generated report to FreshCo KR.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm">
                    <div className="flex gap-3">
                        <button className="flex-1 bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-gray-200 transform hover:-translate-y-0.5">
                            Confirm & Send Instructions
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
