'use client';

import { useEffect, useState } from 'react';
import { BadgeAlert, TrendingUp, CalendarDays } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountabilityWidget } from '@/components/store/AccountabilityWidget';
import { JourneyCard, JourneyScoreStatus } from '@/components/store/JourneyCard';
import { ActionPlanModal } from '@/components/store/ActionPlanModal';

export default function StorePulseDashboard() {
    const [summaryData, setSummaryData] = useState<any>(null);
    const [granularData, setGranularData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Weekly simulation state
    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [summaryRes, granularRes] = await Promise.all([
                    fetch('/api/store/summary'),
                    fetch('/api/store/granular')
                ]);

                setSummaryData(await summaryRes.json());
                setGranularData(await granularRes.json());
            } catch (error) {
                console.error("Failed to fetch store pulse data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    if (isLoading || !summaryData || !granularData) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                        <p className="text-slate-500 font-medium">Syncing live ESS feeds...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Helper to map score/status to strict JourneyCard colors
    const determineJourneyStatus = (plan: any): JourneyScoreStatus => {
        if (plan.type === 'qualitative') return 'ai-alert';
        if (plan.journeyScore < 80) return 'red';
        if (plan.journeyScore < 90) return 'yellow';
        return 'green';
    };

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Context Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{summaryData.store.name}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium border border-primary/20">
                            {summaryData.store.league}
                        </span>
                        <span>•</span>
                        <span>{summaryData.store.code}</span>
                        <span>•</span>
                        <span>{summaryData.store.branch}</span>
                    </div>
                </div>

                {summaryData.activeAlert?.hasUrgentFeedback && (
                    <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl flex items-start gap-4">
                        <BadgeAlert className="w-6 h-6 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium leading-relaxed">
                            {summaryData.activeAlert.message}
                        </p>
                    </div>
                )}


                {/* Action Plan Portal (Bottom Split) */}
                <div className="pt-4 border-t border-slate-200/60 mt-8 mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                        <CalendarDays className="w-6 h-6 text-primary" />
                        Mission Board Tracker
                    </h2>
                    <p className="text-slate-500 mt-1">Resolve your Store Improvement Focuses before the next Wave.</p>
                </div>

                {/* Horizontal Week Navigator (Simulated Tabs) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hidden">
                    {[1, 2, 3, 4, 5].map((w) => (
                        <button
                            key={w}
                            onClick={() => setActiveWeek(w)}
                            className={`px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${activeWeek === w
                                ? 'bg-slate-900 text-white shadow-md'
                                : 'bg-white/60 border border-slate-200 text-slate-600 hover:bg-white'
                                }`}
                        >
                            {w === 4 ? `Week ${w} (Overdue Demo)` : `Week ${w}`}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
                    {/* 25% Column - Accountability Widget */}
                    <div className="xl:col-span-1 h-full w-full">
                        <AccountabilityWidget
                            slaPercentage={75}
                            streakCount={3}
                            badgeStatus="Silver League"
                            isOverdue={activeWeek === 4} // Memancing penalti kura-kura saat menekan week 4
                        />
                    </div>

                    {/* 75% Column - Action Cards Feed */}
                    <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                        {granularData.actionPlans.map((plan: any) => (
                            <JourneyCard
                                key={plan.id}
                                title={plan.journey}
                                score={plan.journeyScore}
                                status={determineJourneyStatus(plan)}
                                failedItemsCount={plan.failedItems?.length || 0}
                                isActionRequired={plan.status === 'Requires Action' || plan.status === 'Revision Required'}
                                onClick={() => setSelectedPlan(plan)}
                            />
                        ))}
                    </div>
                </div>

            </div>

            <ActionPlanModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                planData={selectedPlan}
                activeWeek={activeWeek}
            />
        </DashboardLayout>
    );
}
