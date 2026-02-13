import { Siren } from 'lucide-react';

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
                <Siren className="w-8 h-8" strokeWidth={2} />
                <div className={`text-xl font-bold tracking-widest ${colorClass} ml-2 uppercase`}>
                    Frima
                </div>
            </div>
        </div>
    );
}

