import React from 'react';

interface ScoreBarProps {
    value: number;
    max?: number;
    showValue?: boolean;
}

export function ScoreBar({ value, max = 100, showValue = true }: ScoreBarProps) {
    const percentage = Math.min((value / max) * 100, 100);

    let colorClass = 'bg-blue-500';
    if (percentage >= 80) colorClass = 'bg-green-500';
    else if (percentage >= 60) colorClass = 'bg-yellow-500';
    else colorClass = 'bg-red-500';

    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue && (
                <span className="text-sm font-medium w-8 text-right text-gray-700">{value}</span>
            )}
        </div>
    );
}
