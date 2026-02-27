'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AiTacticalBriefing } from '@/components/managerial/AiTacticalBriefing';
import { ApprovalInboxCard } from '@/components/managerial/ApprovalInboxCard';
import { Layers, CalendarDays, Inbox, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BranchManagerialPortal() {
    const [insightsData, setInsightsData] = useState<any>(null);
    const [approvalQueue, setApprovalQueue] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeWeek, setActiveWeek] = useState<number>(1);

    useEffect(() => {
        const fetchManagerialData = async () => {
            setIsLoading(true);
            try {
                const [insightsRes, queueRes] = await Promise.all([
                    fetch(`/api/managerial/insights?scope=branch&week=${activeWeek}`),
                    fetch(`/api/managerial/approval-queue?week=${activeWeek}`)
                ]);

                setInsightsData(await insightsRes.json());
                setApprovalQueue(await queueRes.json());
            } catch (error) {
                console.error("Failed to fetch managerial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManagerialData();
    }, [activeWeek]);

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
                body: JSON.stringify({ actionPlanId: id, action: 'reject', rejectReason: reason })
            });
            if (!res.ok) throw new Error("API failed");

            // Optimistic UI Update: Remove from queue
            setApprovalQueue((prev: any) => ({
                ...prev,
                summary: { ...prev.summary, totalPending: prev.summary.totalPending - 1 },
                queue: prev.queue.filter((item: any) => item.id !== id)
            }));
            toast.error("Revision Sent", { description: `Toko dikabari ulang: "${reason}"` });
        } catch (e) {
            toast.error("Gagal mengirim revisi");
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Context Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <Layers className="w-8 h-8 text-indigo-600" />
                            Branch Operations Panel
                        </h1>
                        <p className="text-slate-500 text-sm">Cabang Bandung Raya • Mengawasi 18 Toko</p>
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
                                ALL TIME
                            </Button>
                        </div>
                    </div>
                </div>

                {/* The AI Insights Hero Component */}
                <AiTacticalBriefing
                    data={insightsData}
                    isLoading={isLoading}
                    scope="branch"
                />

                {/* The Execution / Inbox UI */}
                <div className="pt-6">
                    <div className="flex items-end justify-between border-b border-slate-200/60 pb-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                <Inbox className="w-6 h-6 text-emerald-600" />
                                Rapid Approval Feed
                            </h2>
                            <p className="text-slate-500 mt-1">
                                {approvalQueue?.summary?.totalPending || 0} Action Plans waiting for your triage.
                            </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2].map(i => (
                                <div key={i} className="w-full h-[250px] rounded-xl bg-slate-100 animate-pulse border border-slate-200/50"></div>
                            ))}
                        </div>
                    ) : approvalQueue?.queue?.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                            <h3 className="text-lg font-bold text-slate-800">Inbox Clear!</h3>
                            <p className="text-slate-500 text-sm">You have zero pending approvals for this week.</p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {approvalQueue.queue.map((item: any) => (
                                <ApprovalInboxCard
                                    key={item.id}
                                    item={item}
                                    onApprove={handleApprove}
                                    onReject={handleReject}
                                />
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
