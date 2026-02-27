'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, ActivitySquare, Scale, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NationalInsightData {
    meta: {
        persona: string;
        analysisPeriod: string;
        analyzedRegions: number;
        analyzedBranches: number;
        analyzedStores: number;
    };
    systemicRisks: any[];
    policyInterventions: any[];
    bestPractices: any[];
}

interface AiNationalBriefingProps {
    data: NationalInsightData | null;
    isLoading: boolean;
}

export function AiNationalBriefing({ data, isLoading }: AiNationalBriefingProps) {
    const [activeTab, setActiveTab] = useState<'systemicRisks' | 'policyInterventions' | 'bestPractices'>('systemicRisks');

    if (isLoading || !data) {
        return (
            <Card className="glass-panel overflow-hidden border-slate-900/10 bg-gradient-to-br from-slate-900/5 to-transparent relative min-h-[300px]">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-slate-900/40">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                        <p className="text-sm font-medium tracking-widest uppercase">Synthesizing National Data...</p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="glass-panel overflow-hidden border-slate-800 shadow-[0_8px_40px_rgba(15,23,42,0.12)] bg-gradient-to-br from-slate-50 relative via-white to-slate-100/50">

            {/* Absolute Decorative Blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-slate-200/50 to-transparent rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            {/* Header Corporate AI */}
            <div className="border-b border-slate-200 bg-slate-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                        <Sparkles className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            {data.meta.persona}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mt-1 font-medium">
                            <span className="text-indigo-300">{data.meta.analysisPeriod}</span>
                            <span>•</span>
                            <span>{data.meta.analyzedRegions} Regions</span>
                            <span>•</span>
                            <span>{data.meta.analyzedStores} Stores Total Data Array</span>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-sm backdrop-blur-sm">
                    Strictly Confidential
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 relative z-10">
                {/* Top Navigation / Tabs (1 col on lg, stacked on md) */}
                <div className="lg:col-span-1 border-r border-slate-200/60 p-5 space-y-3 bg-white/40">
                    <button
                        onClick={() => setActiveTab('systemicRisks')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all border",
                            activeTab === 'systemicRisks' ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-900/20" : "hover:bg-slate-100 border-transparent text-slate-600"
                        )}
                    >
                        <ActivitySquare className={cn("w-5 h-5", activeTab === 'systemicRisks' ? "text-indigo-400" : "")} />
                        Systemic Risks
                    </button>
                    <button
                        onClick={() => setActiveTab('policyInterventions')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all border",
                            activeTab === 'policyInterventions' ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-900/20" : "hover:bg-slate-100 border-transparent text-slate-600"
                        )}
                    >
                        <Scale className={cn("w-5 h-5", activeTab === 'policyInterventions' ? "text-indigo-400" : "")} />
                        Policy Interventions
                    </button>
                    <button
                        onClick={() => setActiveTab('bestPractices')}
                        className={cn(
                            "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-sm font-bold transition-all border",
                            activeTab === 'bestPractices' ? "bg-slate-900 border-slate-800 text-white shadow-md shadow-slate-900/20" : "hover:bg-slate-100 border-transparent text-slate-600"
                        )}
                    >
                        <Award className={cn("w-5 h-5", activeTab === 'bestPractices' ? "text-indigo-400" : "")} />
                        Best Practices
                    </button>
                </div>

                {/* Content Area (3 cols) */}
                <div className="lg:col-span-3 p-8 bg-white/20">

                    {activeTab === 'systemicRisks' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Systemic National Risks</h3>
                                <p className="text-slate-500 mt-1 font-medium">Critical vulnerabilities identified across multi-regional data analysis.</p>
                            </div>

                            <div className="grid gap-6">
                                {data.systemicRisks.map((sr) => (
                                    <div key={sr.id} className="bg-white border text-left border-rose-200/60 rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500"></div>
                                        <h4 className="font-bold text-slate-900 text-lg mb-3 pr-4 group-hover:text-rose-700 transition-colors">{sr.title}</h4>
                                        <p className="text-[15px] text-slate-600 mb-5 leading-relaxed">{sr.description}</p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                                            <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                                                <span className="text-[10px] uppercase tracking-widest font-black text-rose-500 mb-1 block">Est. Business Impact</span>
                                                <p className="font-semibold text-rose-950 text-sm">{sr.businessImpact}</p>
                                            </div>
                                            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                                                <span className="text-[10px] uppercase tracking-widest font-black text-emerald-600 mb-1 block">Strategic Recommendation</span>
                                                <p className="font-semibold text-emerald-950 text-sm">{sr.recommendation}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'policyInterventions' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Corporate Policy Interventions</h3>
                                <p className="text-slate-500 mt-1 font-medium">Standard Operating Procedures requiring immediate C-Level revision.</p>
                            </div>
                            <div className="grid gap-6">
                                {data.policyInterventions.map((pi) => (
                                    <div key={pi.id} className="bg-white border-2 border-indigo-100 rounded-2xl p-6 relative">
                                        <h4 className="font-bold text-indigo-950 text-xl mb-3">{pi.title}</h4>
                                        <p className="text-slate-600 mb-6 text-[15px] leading-relaxed">{pi.description}</p>
                                        <div className="flex items-start gap-4 p-4 bg-slate-900 rounded-xl">
                                            <Scale className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                                            <div>
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">Required Action Directive</span>
                                                <p className="text-white text-sm font-medium">{pi.actionRequired}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'bestPractices' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">National Best Practices</h3>
                                <p className="text-slate-500 mt-1 font-medium">Top performing territories recommended for corporate recognition.</p>
                            </div>
                            <div className="grid gap-6">
                                {data.bestPractices.map((bp) => (
                                    <div key={bp.id} className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start shadow-sm">
                                        <div className="p-4 bg-amber-100 rounded-2xl shrink-0">
                                            <Award className="w-10 h-10 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg mb-2">{bp.subject}</h4>
                                            <p className="text-slate-700 text-[15px] leading-relaxed mb-4">{bp.description}</p>
                                            <div className="inline-block px-4 py-2 bg-amber-500/10 text-amber-700 font-bold text-sm rounded-lg border border-amber-500/20">
                                                {bp.rewardSuggestion}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </Card>
    );
}
