import React from 'react';

type StatusType = 'good' | 'warning' | 'danger' | 'neutral' | 'success';

interface StatusBadgeProps {
    status: string;
    type?: StatusType;
    className?: string;
}

export function StatusBadge({ status, type = 'neutral', className }: StatusBadgeProps) {
    const styles = {
        good: 'bg-green-100 text-green-700 border-green-200',
        success: 'bg-blue-100 text-blue-700 border-blue-200',
        warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        danger: 'bg-red-100 text-red-700 border-red-200',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    // Auto-detect type if not provided based on common keywords
    let finalType = type;
    if (type === 'neutral') {
        if (['양호', '운영중', 'S등급', 'A등급'].includes(status)) finalType = 'good';
        if (['주의', '점검요망', '휴업', 'B등급'].includes(status)) finalType = 'warning';
        if (['위험', '폐업', 'C등급', 'D등급'].includes(status)) finalType = 'danger';
        if (['확정', '완료'].includes(status)) finalType = 'success';
    }

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[finalType]} ${className}`}>
            {status}
        </span>
    );
}
