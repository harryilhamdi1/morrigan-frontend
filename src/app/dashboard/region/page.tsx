'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiTacticalBriefing } from '@/components/managerial/AiTacticalBriefing';
import { BranchHealthRoster } from '@/components/managerial/BranchHealthRoster';
import { Globe, CalendarDays, Activity, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function RegionalExecutivePortal() {
    const [insightsData, setInsightsData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeWeek, setActiveWeek] = useState<number>(1);

    // RBAC & Regions State
    const [userRole, setUserRole] = useState<string>('');
    const [availableRegions, setAvailableRegions] = useState<{ id: string, name: string }[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState<string>('');
    const [regionLabel, setRegionLabel] = useState<string>('Loading...');

    const supabase = createClient();

    // 1. Fetch User Profile & Regions based on Role
    useEffect(() => {
        async function fetchContext() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('user_profiles').select('role, region_id').eq('id', user.id).single();
                if (!profile) return;

                setUserRole(profile.role);

                if (['HCBP', 'Superadmin'].includes(profile.role)) {
                    // Admin can see all regions
                    const { data: regions } = await supabase.from('regions').select('id, name');
                    if (regions && regions.length > 0) {
                        setAvailableRegions(regions);
                        setSelectedRegionId(regions[0].id);
                        setRegionLabel(regions[0].name);
                    }
                } else if (profile.role === 'Regional Director' && profile.region_id) {
                    // Locked to one region
                    const { data: r } = await supabase.from('regions').select('id, name').eq('id', profile.region_id).single();
                    if (r) {
                        setAvailableRegions([r]);
                        setSelectedRegionId(r.id);
                        setRegionLabel(r.name);
                    }
                }
            } catch (err) {
                console.error("Fetch context error", err);
            }
        }
        fetchContext();
    }, [supabase]);

    // 2. Fetch Dashboard Data whenever selectedRegionId or activeWeek changes
    useEffect(() => {
        if (!selectedRegionId) return;

        const fetchRegionalData = async () => {
            setIsLoading(true);
            try {
                // Pass region_id properly to API
                const query = new URLSearchParams({ scope: 'region', week: activeWeek.toString() });
                if (selectedRegionId) query.append('region_id', selectedRegionId);

                const res = await fetch(`/api/managerial/insights?${query.toString()}`);
                const data = await res.json();
                setInsightsData(data);

                // Update label based on selection
                const r = availableRegions.find(x => x.id === selectedRegionId);
                if (r) setRegionLabel(r.name);

            } catch (error) {
                console.error("Failed to fetch regional data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRegionalData();
    }, [selectedRegionId, activeWeek, availableRegions]);

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 flex items-center gap-3">
                            <Globe className="w-8 h-8 text-blue-600" />
                            Regional Control Tower
                        </h1>

                        {/* Dynamic Region Selector */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-slate-500 font-medium">Viewing Region:</span>
                            {['HCBP', 'Superadmin'].includes(userRole) && availableRegions.length > 0 ? (
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-8 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                                        value={selectedRegionId}
                                        onChange={(e) => setSelectedRegionId(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {availableRegions.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            ) : (
                                <span className="bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                                    {regionLabel}
                                </span>
                            )}
                        </div>
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
                                <p className="text-sm font-medium text-slate-500 mb-1">Store Count</p>
                                <h3 className="text-2xl font-bold text-slate-900">{insightsData?.meta?.analyzedStores || 0}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Active Overdue</p>
                                <h3 className="text-2xl font-bold text-rose-600">
                                    {insightsData?.hotspots?.reduce((acc: number, hs: any) => acc + (parseInt(hs.metric) || 0), 0) || 0} Plans
                                </h3>
                                <p className="text-[10px] uppercase font-bold text-slate-400 mt-1">SLA Breach</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm">
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Top Offender Area</p>
                                <h3 className="text-lg font-bold text-amber-600 truncate max-w-[120px]">
                                    {insightsData?.hotspots?.[0]?.entityName || 'None'}
                                </h3>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-slate-200/60 shadow-sm bg-gradient-to-br from-emerald-500 to-teal-600">
                        <CardContent className="p-5 flex items-center justify-between text-white">
                            <div>
                                <p className="text-sm font-medium text-emerald-100 mb-1">Fastest Execution</p>
                                <h3 className="text-lg font-bold truncate max-w-[150px]">
                                    {insightsData?.praises?.[0]?.title ? insightsData.praises[0].title.split(' - ')[0] : 'None'}
                                </h3>
                                <p className="text-[10px] uppercase font-bold text-emerald-200 mt-1">Best Practice</p>
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
                    {/* Only render BranchHealthRoster when we have a selected region, and we pass it as a prop so it filters */}
                    {selectedRegionId && <BranchHealthRoster regionId={selectedRegionId} />}
                </div>

            </div>
        </DashboardLayout>
    );
}
