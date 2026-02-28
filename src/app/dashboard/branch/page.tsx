'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiTacticalBriefing } from '@/components/managerial/AiTacticalBriefing';
import { ApprovalInboxCard } from '@/components/managerial/ApprovalInboxCard';
import { Layers, CalendarDays, Inbox, CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function BranchManagerialPortal() {
    const [insightsData, setInsightsData] = useState<any>(null);
    const [approvalQueue, setApprovalQueue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeWeek, setActiveWeek] = useState<number>(1);

    // RBAC & Branch State
    const [userRole, setUserRole] = useState<string>('');
    const [availableBranches, setAvailableBranches] = useState<{ id: string, name: string }[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>('');
    const [branchLabel, setBranchLabel] = useState<string>('Loading...');

    const supabase = createClient();

    // 1. Fetch User Profile & Branches based on Role
    useEffect(() => {
        async function fetchContext() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('user_profiles').select('role, region_id, branch_id').eq('id', user.id).single();
                if (!profile) return;

                setUserRole(profile.role);

                if (['HCBP', 'Superadmin'].includes(profile.role)) {
                    // Admin can see all branches
                    const { data: b } = await supabase.from('branches').select('id, name');
                    if (b && b.length > 0) {
                        setAvailableBranches(b);
                        setSelectedBranchId(b[0].id);
                        setBranchLabel(b[0].name);
                    }
                } else if (profile.role === 'Regional Director' && profile.region_id) {
                    // Locked to one region's branches
                    const { data: b } = await supabase.from('branches').select('id, name').eq('region_id', profile.region_id);
                    if (b && b.length > 0) {
                        setAvailableBranches(b);
                        setSelectedBranchId(b[0].id);
                        setBranchLabel(b[0].name);
                    }
                } else if (profile.role === 'Branch Head' && profile.branch_id) {
                    // Locked to one branch
                    const { data: b } = await supabase.from('branches').select('id, name').eq('id', profile.branch_id).single();
                    if (b) {
                        setAvailableBranches([b]);
                        setSelectedBranchId(b.id);
                        setBranchLabel(b.name);
                    }
                }
            } catch (err) {
                console.error("Fetch context error", err);
            }
        }
        fetchContext();
    }, [supabase]);

    // 2. Fetch Dashboard Data whenever selectedBranchId or activeWeek changes
    useEffect(() => {
        if (!selectedBranchId) return;

        const fetchManagerialData = async () => {
            setIsLoading(true);
            try {
                const query = new URLSearchParams({ scope: 'branch', week: activeWeek.toString() });
                if (selectedBranchId) query.append('branch_id', selectedBranchId);

                const [insightsRes, queueRes] = await Promise.all([
                    fetch(`/api/managerial/insights?${query.toString()}`),
                    fetch(`/api/managerial/approval-queue?${query.toString()}`)
                ]);

                setInsightsData(await insightsRes.json());
                setApprovalQueue(await queueRes.json());

                const b = availableBranches.find(x => x.id === selectedBranchId);
                if (b) setBranchLabel(b.name);
            } catch (error) {
                console.error("Failed to fetch managerial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManagerialData();
    }, [selectedBranchId, activeWeek, availableBranches]);

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch('/api/managerial/approval-queue', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionPlanId: id, action: 'approve' })
            });
            if (!res.ok) throw new Error("API failed");

            // Optimistic UI Update: Remove from queue
            setApprovalQueue((prev: any) => ({
                ...prev,
                summary: { ...prev.summary, totalPending: prev.summary.totalPending - 1 },
                queue: prev.queue.filter((item: any) => item.id !== id)
            }));
            toast.success("Action Plan Approved", { description: "Sedang dinaikkan ke HCBP Nasional." });
        } catch (e) {
            toast.error("Gagal menyetujui Action Plan");
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            const res = await fetch('/api/managerial/approval-queue', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actionPlanId: id, action: 'reject', reason })
            });
            if (!res.ok) throw new Error("API failed");

            setApprovalQueue((prev: any) => ({
                ...prev,
                summary: { ...prev.summary, totalPending: prev.summary.totalPending - 1 },
                queue: prev.queue.filter((item: any) => item.id !== id)
            }));
            toast.success("Action Plan Rejected", { description: "Dikembalikan ke Cabang/Toko untuk revisi." });
        } catch (e) {
            toast.error("Gagal menolak Action Plan");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-4 flex items-center gap-3">
                            <Layers className="w-8 h-8 text-indigo-600" />
                            Branch Operation Desk
                        </h1>

                        {/* Dynamic Branch Selector */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-slate-500 font-medium">Viewing Branch:</span>
                            {['HCBP', 'Superadmin', 'Regional Director'].includes(userRole) && availableBranches.length > 0 ? (
                                <div className="relative">
                                    <select
                                        className="appearance-none bg-white border border-slate-300 text-slate-900 font-bold text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-3 pr-8 py-1.5 cursor-pointer hover:bg-slate-50 transition-colors"
                                        value={selectedBranchId}
                                        onChange={(e) => setSelectedBranchId(e.target.value)}
                                        disabled={isLoading}
                                    >
                                        {availableBranches.map(b => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                </div>
                            ) : (
                                <span className="bg-slate-100 text-slate-800 text-sm font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                                    {branchLabel}
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
                                    className={`rounded-lg px-4 ${activeWeek === w ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-900'}`}
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
                                YTD
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tactical Action Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Direct Execution / Approval Queue */}
                    <div className="lg:col-span-2 flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                <Inbox className="w-5 h-5 text-indigo-500" />
                                Action Plan Approval Queue
                            </h2>
                            {approvalQueue && approvalQueue.summary.totalPending > 0 ? (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    {approvalQueue.summary.totalPending} Pending Response
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    All Caught Up
                                </span>
                            )}
                        </div>

                        {/* Queue Items */}
                        <div className="flex-1 space-y-4 min-h-[400px]">
                            {isLoading ? (
                                <div className="h-40 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                                    <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full opacity-50"></div>
                                </div>
                            ) : approvalQueue?.queue?.length > 0 ? (
                                approvalQueue.queue.map((item: any) => (
                                    <ApprovalInboxCard
                                        key={item.id}
                                        id={item.id}
                                        date={item.date}
                                        store={item.store}
                                        journey={item.journey}
                                        rca={item.rca}
                                        action={item.action}
                                        deadline={item.deadline}
                                        onApprove={() => handleApprove(item.id)}
                                        onReject={(reason) => handleReject(item.id, reason)}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-12 text-center">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 opacity-50" />
                                    <p className="font-semibold text-slate-600">Great job!</p>
                                    <p className="text-sm max-w-sm">There are no Action Plans requiring your approval at this moment. You're completely up to date.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Branch Level AI Intelligence */}
                    <div className="lg:col-span-1 space-y-6">
                        <AiTacticalBriefing
                            data={insightsData}
                            isLoading={isLoading}
                            scope="branch"
                        />
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
