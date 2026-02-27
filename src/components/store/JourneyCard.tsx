import { AlertCircle, CheckCircle2, AlertTriangle, ArrowRight, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type JourneyScoreStatus = 'red' | 'yellow' | 'green' | 'ai-alert';

interface JourneyCardProps {
    title: string;
    score: number | null; // Null implies qualitative AI card
    status: JourneyScoreStatus;
    failedItemsCount: number;
    targetNationalUrl?: string; // Optional context
    isActionRequired: boolean;
    onClick?: () => void;
}

export function JourneyCard({
    title, score, status, failedItemsCount, isActionRequired, onClick
}: JourneyCardProps) {

    // Dynamic styling based on the strict color coding rules
    const colorStyles = {
        'red': 'border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive',
        'yellow': 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-amber-600',
        'green': 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600',
        'ai-alert': 'border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-purple-600',
    };

    const currentStyle = colorStyles[status] || colorStyles['green'];

    return (
        <div
            onClick={onClick}
            className={cn(
                "glass-card cursor-pointer border rounded-xl p-5 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group",
                currentStyle,
                isActionRequired ? 'shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-destructive/20' : ''
            )}
        >
            {/* Action Required Pulsing Indicator */}
            {isActionRequired && (
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-destructive text-white text-[10px] font-bold uppercase tracking-wider py-1 px-8 rotate-45 shadow-sm shadow-destructive/50 animate-pulse">
                        Action
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="font-semibold text-slate-800 text-base max-w-[85%] leading-tight">
                    {title}
                </div>
                {status === 'green' && <CheckCircle2 className="w-6 h-6 shrink-0 opacity-80" />}
                {status === 'yellow' && <AlertTriangle className="w-6 h-6 shrink-0 opacity-80" />}
                {(status === 'red' || status === 'ai-alert') && <AlertCircle className="w-6 h-6 shrink-0 opacity-80" />}
            </div>

            <div className="flex items-end justify-between mt-6">
                <div>
                    {score !== null ? (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold tracking-tighter mix-blend-multiply opacity-90">{score}</span>
                            <span className="text-sm font-medium opacity-60">/100</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 opacity-80">
                            <UserCircle className="w-5 h-5" />
                            <span className="text-sm font-bold">Voice of Customer</span>
                        </div>
                    )}

                    <p className="text-xs font-medium opacity-60 mt-1">
                        {failedItemsCount > 0 ? `${failedItemsCount} Failed Item${failedItemsCount > 1 ? 's' : ''}` : 'All criteria met'}
                    </p>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 hover:bg-white/80"
                >
                    <ArrowRight className="w-4 h-4 text-slate-900" />
                </Button>
            </div>
        </div>
    );
}
