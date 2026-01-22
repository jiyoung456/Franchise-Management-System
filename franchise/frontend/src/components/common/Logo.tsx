import { Pizza } from 'lucide-react';

interface LogoProps {
    variant?: 'white' | 'color';
    className?: string;
}

export function Logo({ variant = 'color', className = '' }: LogoProps) {
    const isWhite = variant === 'white';
    const colorClass = isWhite ? 'text-white' : 'text-[#2CA4D9]';

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`flex items-center ${colorClass}`}>
                <Pizza className="w-8 h-8 -rotate-12" strokeWidth={1.5} />
                <div className={`text-xl font-bold tracking-widest ${colorClass} ml-2`}>
                    알피자
                </div>
            </div>
        </div>
    );
}
