'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiNationalBriefing } from '@/components/executive/AiNationalBriefing';
import { ComplianceRadarCharts } from '@/components/executive/ComplianceRadarCharts';
import { Component, CalendarDays, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NationalExecutivePortal() {
    const [insightsData, setInsightsData] = useState<any>(null);
    const [complianceData, setComplianceData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activePeriod, setActivePeriod] = useState<string>('Q1');

    useEffect(() => {
        const fetchExecutiveData = async () => {
            setIsLoading(true);
            try {
                const [insightsRes, complianceRes] = await Promise.all([
                    fetch(`/api/executive/insights?period=${activePeriod}`),
                    fetch(`/api/executive/compliance?period=${activePeriod}`)
                ]);
                setInsightsData(await insightsRes.json());
                setComplianceData(await complianceRes.json());
            } catch (error) {
                console.error("Failed to fetch executive data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchExecutiveData();
    }, [activePeriod]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <Component className="w-9 h-9 text-slate-900" />
                            Executive Command Center
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">National Operations • 5 Regions • 32 Branches • 412 Stores</p>
                    </div>

                    {/* Macro Time Picker */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <CalendarDays className="w-4 h-4 text-slate-400 ml-2" />
                        <div className="flex">
                            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                                <Button
                                    key={q}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActivePeriod(q)}
                                    className={`rounded-lg px-4 font-bold ${activePeriod === q ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    {q}
                                </Button>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActivePeriod('YTD')}
                                className={`rounded-lg px-4 uppercase font-black text-xs tracking-wider ${activePeriod === 'YTD' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-indigo-600'}`}
                            >
                                YTD ALL TIME
                            </Button>
                        </div>
                    </div>
                </div>

                {/* The Compliance Radar (Recharts KPI) */}
                <div className="mb-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight px-1 flex items-center gap-2">
                        <LineChart className="w-5 h-5 text-indigo-500" />
                        Hierarchy Compliance Radar
                    </h2>
                    <ComplianceRadarCharts data={complianceData} isLoading={isLoading} />
                </div>

                {/* The National AI Briefing (Level 3 Map-Reduce) */}
                <div className="pt-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight px-1 flex items-center gap-2">
                        <Component className="w-5 h-5 text-slate-400" />
                        Map-Reduce National Synthesis
                    </h2>
                    <AiNationalBriefing
                        data={insightsData}
                        isLoading={isLoading}
                    />
                </div>

            </div>
        </DashboardLayout>
    );
}
