'use client';

import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';

export function UrgentInsights() {
    return (
        <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-xl border border-rose-100 p-6 flex items-start justify-between shadow-sm">
            <div className="flex gap-4">
                <div className="bg-white p-3 rounded-full flex items-center justify-center shadow-sm h-12 w-12 text-rose-500 shrink-0">
                    <Zap size={24} fill="currentColor" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        AI Detected: Major Risk Cluster in Gangnam Area
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-bold">URGENT</span>
                    </h2>
                    <p className="text-gray-600 mt-1 max-w-2xl">
                        3 stores in Gangnam district show a simultaneous decline in hygiene scores (-15%) over the last 48 hours.
                        Potential supplier issue suspected.
                    </p>
                </div>
            </div>

            <button className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2">
                Create Bulk Action
                <ArrowRight size={18} />
            </button>
        </div>
    );
}
