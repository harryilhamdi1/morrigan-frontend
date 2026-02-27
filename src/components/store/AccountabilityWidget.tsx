'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Target, Timer, Flame, Lock, ShieldCheck, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AccountabilityWidgetProps {
    slaPercentage: number;
    streakCount: number;
    badgeStatus: 'Gold League' | 'Silver League' | 'Bronze League' | 'Rising Star';
    isOverdue: boolean;
}

export function AccountabilityWidget({
    slaPercentage, streakCount, badgeStatus, isOverdue
}: AccountabilityWidgetProps) {
    const [isLocked, setIsLocked] = useState(isOverdue);
    const [penaltyText, setPenaltyText] = useState('');

    // Determine Gauge Color
    let gaugeColor = 'text-emerald-500';
    if (slaPercentage < 80) gaugeColor = 'text-destructive';
    else if (slaPercentage < 95) gaugeColor = 'text-amber-500';

    const handleUnlock = () => {
        if (penaltyText.length >= 50) {
            setIsLocked(false);
        }
    };

    return (
        <Card className="glass-panel overflow-hidden relative h-full">
            {/* Locked Overlay for Motivational Penalty */}
            {isLocked && (
                <div className="absolute inset-0 z-20 bg-slate-100/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
                    <div className="bg-destructive/10 p-4 rounded-full text-destructive mb-4 animate-bounce">
                        <Timer className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg mb-1">Oops, keretanya sudah lewat!</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-[250px]">
                        Batas waktu pengisian form minggu ini telah terlewat. Sistem mengunci eksekusi Anda (Turtle Penalty).
                    </p>

                    <div className="w-full space-y-3">
                        <label className="text-xs font-semibold text-slate-700 text-left block">
                            Alasan Keterlambatan Pengisian {penaltyText.length}/50
                        </label>
                        <Textarea
                            value={penaltyText}
                            onChange={(e) => setPenaltyText(e.target.value)}
                            className="text-sm bg-white/80 resize-none h-24 border-destructive/20 focus-visible:ring-destructive"
                            placeholder="Ketik minimal 50 karakter agar bisa membuka kunci form..."
                        />
                        <Button
                            className="w-full bg-slate-900 text-white"
                            disabled={penaltyText.length < 50}
                            onClick={handleUnlock}
                        >
                            <Lock className="w-4 h-4 mr-2" />
                            Unlock Execution Zone
                        </Button>
                    </div>
                </div>
            )}

            <CardHeader className="pb-4 border-b border-slate-200/50">
                <CardTitle className="text-lg text-slate-900 flex items-center justify-between">
                    Accountability
                    <Target className="w-5 h-5 text-primary" />
                </CardTitle>
                <CardDescription>Q1 2025 Performance</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">

                {/* SLA Gauge */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        {/* Fake SVG Circle Gauge */}
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-200" />
                            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8"
                                strokeDasharray={`${slaPercentage * 2.8} 280`}
                                className={cn("transition-all duration-1000 ease-out", gaugeColor)}
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                            <span className={cn("text-3xl font-bold tracking-tighter", gaugeColor)}>{slaPercentage}%</span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">SLA Rate</span>
                        </div>
                    </div>
                    <p className="text-xs text-center text-slate-500 mt-4 max-w-[200px]">
                        Penyelesaian <strong className="text-slate-700">On-Time</strong> dari total Action Plan periode ini.
                    </p>
                </div>

                <div className="w-full h-px bg-slate-200/50"></div>

                {/* Tracking Counters */}
                <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-orange-500/5 border border-orange-500/20 p-3 rounded-xl">
                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-600">
                            <Flame className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{streakCount} Resolved</p>
                            <p className="text-xs text-slate-500">Current winning streak</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-primary/5 border border-primary/20 p-3 rounded-xl">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">{badgeStatus}</p>
                            <p className="text-xs text-slate-500">Current store league</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
