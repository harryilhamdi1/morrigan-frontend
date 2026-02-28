'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, ShieldAlert, TimerReset, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from '@/lib/supabase/client';

interface BranchData {
    id: string;
    name: string;
    totalStores: number;
    completionRate: number;
    turtleBadges: number;
    overdueTasks: number;
    healthStatus: 'Excellent' | 'Warning' | 'Critical';
}

export function BranchHealthRoster() {
    const [rosterData, setRosterData] = useState<BranchData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRoster() {
            try {
                const supabase = createClient();

                // Get branches with their stores
                const { data: branches } = await supabase
                    .from('branches')
                    .select('id, name, stores(id)');

                if (!branches) { setLoading(false); return; }

                const result: BranchData[] = [];

                for (const branch of branches) {
                    const storeIds = (branch.stores as any[])?.map(s => s.id) || [];
                    if (storeIds.length === 0) continue;

                    // Get action plans for this branch's stores
                    const { data: plans } = await supabase
                        .from('action_plans')
                        .select('status, due_date')
                        .in('store_id', storeIds);

                    const now = new Date();
                    let resolved = 0;
                    let overdue = 0;
                    const total = plans?.length || 0;

                    plans?.forEach(p => {
                        if (p.status === 'Resolved') resolved++;
                        if (p.status === 'Requires Action' && p.due_date && new Date(p.due_date) < now) overdue++;
                    });

                    const completionRate = total > 0 ? Math.round((resolved / total) * 100) : 100;
                    const healthStatus: BranchData['healthStatus'] =
                        completionRate > 90 ? 'Excellent' :
                            completionRate > 75 ? 'Warning' : 'Critical';

                    result.push({
                        id: branch.id,
                        name: branch.name,
                        totalStores: storeIds.length,
                        completionRate,
                        turtleBadges: overdue, // Turtle badges = overdue count
                        overdueTasks: overdue,
                        healthStatus
                    });
                }

                // Sort by completion rate ascending (worst first)
                result.sort((a, b) => a.completionRate - b.completionRate);
                setRosterData(result);
            } catch (err) {
                console.error('BranchHealthRoster fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchRoster();
    }, []);

    if (loading) {
        return (
            <Card className="glass-card">
                <CardContent className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                    <span className="ml-2 text-slate-500">Memuat data cabang...</span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="glass-card overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                            <Building2 className="w-5 h-5 text-indigo-600" />
                            Branch Discipline Roster
                        </CardTitle>
                        <CardDescription>Head-to-head comparison of execution compliance across regions.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100 rounded-t-lg">
                            <tr>
                                <th scope="col" className="px-6 py-4 rounded-tl-lg">Branch Entity</th>
                                <th scope="col" className="px-6 py-4">Total Stores</th>
                                <th scope="col" className="px-6 py-4 text-center">Completion Rate</th>
                                <th scope="col" className="px-6 py-4 text-center">Turtle Penalties</th>
                                <th scope="col" className="px-6 py-4 text-center">Active Overdue</th>
                                <th scope="col" className="px-6 py-4 rounded-tr-lg w-20">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rosterData.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Belum ada data Action Plan.</td></tr>
                            ) : rosterData.map((branch) => (
                                <tr key={branch.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${branch.healthStatus === 'Excellent' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                            branch.healthStatus === 'Critical' ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'
                                            }`}></div>
                                        {branch.name}
                                    </td>
                                    <td className="px-6 py-4 font-medium">{branch.totalStores}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-full bg-slate-200 rounded-full h-2 max-w-[80px]">
                                                <div className={`h-2 rounded-full ${branch.completionRate > 90 ? 'bg-emerald-500' : branch.completionRate > 80 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${branch.completionRate}%` }}></div>
                                            </div>
                                            <span className="font-bold text-slate-700 min-w-[4ch] text-right">{branch.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${branch.turtleBadges > 5 ? 'bg-rose-100 text-rose-700 border-rose-200' : branch.turtleBadges > 0 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                                            <TimerReset className="w-3.5 h-3.5" />
                                            {branch.turtleBadges}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${branch.overdueTasks > 5 ? 'bg-rose-100 text-rose-700 border-rose-200' : branch.overdueTasks > 0 ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}>
                                            {branch.overdueTasks === 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                            {branch.overdueTasks}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="ghost" size="sm" className="hover:bg-indigo-50 hover:text-indigo-600 rounded-lg">
                                            <ExternalLink className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
