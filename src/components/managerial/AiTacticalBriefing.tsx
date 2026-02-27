'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle2, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface InsightData {
    meta: {
        persona: string;
        analysisPeriod: string;
        analyzedStores: number;
    };
    bottlenecks: any[];
    praises: any[];
    hotspots: any[];
}

interface AiTacticalBriefingProps {
    data: InsightData | null;
    isLoading: boolean;
    scope?: 'branch' | 'region';
}

export function AiTacticalBriefing({ data, isLoading, scope = 'branch' }: AiTacticalBriefingProps) {
    const [activeTab, setActiveTab] = useState<'bottlenecks' | 'praises' | 'hotspots'>('bottlenecks');
    const [feedback, setFeedback] = useState('');

    if (isLoading || !data) {
        return (
            <Card className="glass-panel overflow-hidden border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent relative min-h-[300px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-purple-600/70">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                        <p className="text-sm font-medium">Gemini AI is analyzing millions of data points...</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="glass-panel overflow-hidden border-purple-500/30 shadow-[0_4px_30px_rgba(168,85,247,0.08)] bg-gradient-to-br from-white via-white to-purple-50/50">

            {/* Header Aura AI */}
            <div className="border-b border-purple-500/20 bg-purple-500/5 p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-600 rounded-xl shadow-md shadow-purple-500/20">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            {data.meta.persona}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5">
                            <span className="font-medium text-purple-700">{data.meta.analysisPeriod}</span>
                            <span>•</span>
                            <span>Analyzed Data from {data.meta.analyzedStores} Stores</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Left Navigation / Tabs (3 cols) */}
                <div className="md:col-span-3 border-r border-slate-200/60 p-4 space-y-2 bg-slate-50/50">
                    <button
                        onClick={() => setActiveTab('bottlenecks')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all",
                            activeTab === 'bottlenecks' ? "bg-purple-100 text-purple-900 shadow-sm" : "hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        <AlertTriangle className={cn("w-4 h-4", activeTab === 'bottlenecks' ? "text-purple-600" : "")} />
                        Top Bottlenecks
                    </button>
                    <button
                        onClick={() => setActiveTab('praises')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all",
                            activeTab === 'praises' ? "bg-emerald-100 text-emerald-900 shadow-sm" : "hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        <TrendingUp className={cn("w-4 h-4", activeTab === 'praises' ? "text-emerald-600" : "")} />
                        Praise & Progress
                    </button>
                    <button
                        onClick={() => setActiveTab('hotspots')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all",
                            activeTab === 'hotspots' ? "bg-orange-100 text-orange-900 shadow-sm" : "hover:bg-slate-100 text-slate-600"
                        )}
                    >
                        <ShieldAlert className={cn("w-4 h-4", activeTab === 'hotspots' ? "text-orange-600" : "")} />
                        Threat Radar
                    </button>
                </div>

                {/* Right Content Area (9 cols) */}
                <div className="md:col-span-9 p-6">

                    {activeTab === 'bottlenecks' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Systemic Issues Detected</h3>
                            <div className="grid gap-4">
                                {data.bottlenecks.map((bn) => (
                                    <div key={bn.id} className="bg-white border text-left border-rose-200 rounded-xl p-4 shadow-sm border-l-4 border-l-rose-500">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-slate-800">{bn.title}</h4>
                                            <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                                {bn.severity}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{bn.description}</p>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${bn.affectedPercentage}%` }}></div>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2 text-right">{bn.affectedPercentage}% {scope === 'region' ? 'Branches' : 'Stores'} Affected</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'praises' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Operational Wins</h3>
                            <div className="grid gap-4">
                                {data.praises.map((pr) => (
                                    <div key={pr.id} className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex gap-4">
                                        <div className="mt-1">
                                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 mb-1">{pr.title}</h4>
                                            <p className="text-sm text-emerald-700/80 leading-relaxed">{pr.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'hotspots' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Urgent Interventions Required</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.hotspots.map((hs) => (
                                    <div key={hs.id} className="bg-gradient-to-b from-orange-50 to-white border border-orange-200 rounded-xl p-5 shadow-sm">
                                        <h4 className="font-bold text-slate-900 mb-1">{hs.entityName}</h4>
                                        <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded mb-3">
                                            {hs.metric}
                                        </span>
                                        <p className="text-sm text-slate-600 italic">"{hs.flagReason}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Managerial Commitment Feedback (The Loop) */}
                    <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <div className="flex items-center gap-2 mb-3">
                            <MessageSquareText className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-slate-900">Strategic Commentary</h4>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                            Berikan arahan atau respon Anda terhadap temuan AI ini. Feedback Anda akan diataskan (escalated) ke {scope === 'region' ? 'National HCBP' : 'Regional Director'}.
                        </p>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Ketik instruksi kebijakan minggu ini berdasarkan temuan di atas..."
                            className="bg-white resize-none text-slate-900 focus-visible:ring-purple-500 border-slate-200 h-24 mb-3"
                        />
                        <div className="flex justify-end">
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                disabled={feedback.length < 10}
                            >
                                Submit Strategic Insight
                            </Button>
                        </div>
                    </div>

                </div>
            </div>
        </Card>
    );
}
