'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiTacticalBriefing } from '@/components/managerial/AiTacticalBriefing';
import { BranchHealthRoster } from '@/components/managerial/BranchHealthRoster';
import { Globe, CalendarDays, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RegionalExecutivePortal() {
    const [insightsData, setInsightsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeWeek, setActiveWeek] = useState<number>(1);

    useEffect(() => {
        const fetchRegionalData = async () => {
            setIsLoading(true);
            try {
                // Fetching "Map-Reduce Level 2" insights targeted for Region
                const res = await fetch(`/api/managerial/insights?scope=region&week=${activeWeek}`);
                setInsightsData(await res.json());
            } catch (error) {
                console.error("Failed to fetch regional data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegionalData();
    }, [activeWeek]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <Globe className="w-8 h-8 text-blue-600" />
                            Regional Control Tower
                        </h1>
                        <p className="text-slate-500 text-sm">Region Jawa - Bali • Overseeing 5 Branches (89 Stores)</p>
                    </div>

                    {/* Simulated Week Picker */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                        <CalendarDays className="w-4 h-4 text-slate-400 ml-2" />
                        <div className="flex">
                            {[1, 2, 3, 4].map((w) => (
                                <Button
                                    key={w}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveWeek(w)}
                                    className={`rounded-lg px-4 ${activeWeek === w ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                                >
                                    W{w}
                                </Button>
                            ))}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveWeek(99)}
                                className={`rounded-lg px-4 uppercase font-bold text-xs tracking-wider ${activeWeek === 99 ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'}`}
                            >
                                YTD ALL TIME
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tactical Statistics Cards (Regional Scope) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="glass-card border-slate-200/60 shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Total Assigned Areas</p>
                                <h3 className="text-2xl font-bold text-slate-900">4,120</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Slowest Branch Queue</p>
                                <h3 className="text-2xl font-bold text-amber-600">Jabodetabek 1</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">14 Pending Approvals</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Global Overdue Rate</p>
                                <h3 className="text-2xl font-bold text-rose-600">3.2%</h3>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">14 Stores affected</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600">
                        <CardContent className="p-5 flex items-center justify-between text-white">
                            <div>
                                <p className="text-sm font-medium text-emerald-100 mb-1">Regional Resolution</p>
                                <h3 className="text-2xl font-bold">86.4%</h3>
                                <p className="text-[10px] uppercase font-bold text-emerald-200 mt-1">+2.1% WoW Growth</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* The AI Executive Summary (Level 2 Map-Reduce) */}
                <div className="mb-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight px-1">AI Executive Briefing</h2>
                    <AiTacticalBriefing
                        data={insightsData}
                        isLoading={isLoading}
                        scope="region"
                    />
                </div>

                {/* The Branch Health Roster Matrix */}
                <div className="pt-4">
                    <BranchHealthRoster />
                </div>

            </div>
        </DashboardLayout>
    );
}
