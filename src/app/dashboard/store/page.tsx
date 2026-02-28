'use client';

import { useEffect, useState, Suspense } from 'react';
import { BadgeAlert, TrendingUp, CalendarDays, Search, Store as StoreIcon, Activity, MapPin, Layers } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccountabilityWidget } from '@/components/store/AccountabilityWidget';
import { JourneyCard, JourneyScoreStatus } from '@/components/store/JourneyCard';
import { ActionPlanModal } from '@/components/store/ActionPlanModal';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Extracted into a Suspense wrapper because useSearchParams requires it in Next.js 13+ App Router
function StoreDashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryStoreId = searchParams.get('storeId');

    const [userRole, setUserRole] = useState<string>('');
    const [profileStoreId, setProfileStoreId] = useState<string | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const [summaryData, setSummaryData] = useState<any>(null);
    const [granularData, setGranularData] = useState<any>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);

    const [activeWeek, setActiveWeek] = useState<number>(1);
    const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

    // Store Selection State
    const [accessibleStores, setAccessibleStores] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();

    useEffect(() => {
        async function fetchContext() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase.from('user_profiles').select('role, store_id, branch_id, region_id').eq('id', user.id).single();
                if (!profile) return;

                setUserRole(profile.role);
                setProfileStoreId(profile.store_id);

                // If user is upper management and NO store is selected in URL, fetch list of accessible stores
                if (['Branch Head', 'Regional Director', 'HCBP', 'Superadmin'].includes(profile.role) && !queryStoreId) {
                    let query = supabase.from('stores').select('id, name, store_code, league_status, branches(name, regions(name))');

                    if (profile.role === 'Branch Head') {
                        query = query.eq('branch_id', profile.branch_id);
                    } else if (profile.role === 'Regional Director') {
                        // Assuming region_id is on branches, we need to join or fetch branch IDs first
                        const { data: b } = await supabase.from('branches').select('id').eq('region_id', profile.region_id);
                        if (b && b.length > 0) {
                            query = query.in('branch_id', b.map(x => x.id));
                        } else {
                            query = query.eq('id', 'INVALID'); // Force empty
                        }
                    }

                    const { data: stores } = await query;
                    setAccessibleStores(stores || []);
                }
            } catch (err) {
                console.error("Fetch context error", err);
            } finally {
                setIsProfileLoading(false);
            }
        }
        fetchContext();
    }, [queryStoreId, supabase]);

    useEffect(() => {
        // If profile is loaded, determine if we should fetch dashboard data
        if (isProfileLoading) return;

        // If Store Head, or if Upper Management WITH queryStoreId, fetch data
        if (profileStoreId || queryStoreId) {
            const fetchAllData = async () => {
                setIsDataLoading(true);
                try {
                    const targetStoreId = queryStoreId || profileStoreId;
                    const urlParam = targetStoreId ? `?storeId=${targetStoreId}` : '';

                    const [summaryRes, granularRes] = await Promise.all([
                        fetch(`/api/store/summary${urlParam}`),
                        fetch(`/api/store/granular${urlParam}`)
                    ]);

                    setSummaryData(await summaryRes.json());
                    setGranularData(await granularRes.json());
                } catch (error) {
                    console.error("Failed to fetch store pulse data", error);
                } finally {
                    setIsDataLoading(false);
                }
            };

            fetchAllData();
        }
    }, [isProfileLoading, profileStoreId, queryStoreId]);

    if (isProfileLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Authenticating & Fetching Profile...</p>
                </div>
            </div>
        );
    }

    // SCENARIO 1: Upper Management Selector Table (No Store Selected)
    if (!profileStoreId && !queryStoreId) {
        const filteredStores = accessibleStores.filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.store_code.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                        <StoreIcon className="w-8 h-8 text-slate-800" />
                        Select Store Mission Board
                    </h1>
                    <p className="text-slate-500">Pick a store to view its detailed execution metrics and action plans.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Store Name or Code..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-slate-900 text-sm focus:border-slate-900"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-bold">Store</th>
                                    <th className="px-6 py-4 font-bold">Location</th>
                                    <th className="px-6 py-4 font-bold">League</th>
                                    <th className="px-6 py-4 font-bold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStores.length > 0 ? filteredStores.map(store => (
                                    <tr key={store.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                                    <StoreIcon className="w-5 h-5 text-slate-500 group-hover:text-slate-900 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{store.name}</p>
                                                    <p className="text-xs text-slate-500">{store.store_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                                                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                                                    {store.branches?.name || '-'}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    {store.branches?.regions?.name || '-'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                                                {store.league_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="group-hover:bg-slate-900 group-hover:text-white transition-colors"
                                                onClick={() => router.push(`/dashboard/store?storeId=${store.id}`)}
                                            >
                                                View Dashboard
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            No stores found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // SCENARIO 2: Actual Store Dashboard Loading
    if (isDataLoading || !summaryData || !granularData) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                    <p className="text-slate-500 font-medium">Syncing live ESS feeds...</p>
                </div>
            </div>
        );
    }

    // Helper to map score/status to strict JourneyCard colors
    const determineJourneyStatus = (plan: any): JourneyScoreStatus => {
        if (plan.type === 'qualitative') return 'ai-alert';
        if (plan.status === 'Resolved') return 'green';
        if (plan.journeyScore && plan.journeyScore < 80) return 'red';
        return 'yellow';
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
            {/* Header Area with Optional Back Button */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
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

                {queryStoreId && (
                    <Button variant="outline" onClick={() => router.push('/dashboard/store')}>
                        Back to Selection
                    </Button>
                )}
            </div>

            {summaryData.activeAlert?.hasUrgentFeedback && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-xl flex items-start gap-4">
                    <BadgeAlert className="w-6 h-6 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium leading-relaxed">
                        {summaryData.activeAlert.message}
                    </p>
                </div>
            )}

            {/* Action Plan Portal */}
            <div className="pt-4 border-t border-slate-200/60 mt-8 mb-4">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <CalendarDays className="w-6 h-6 text-primary" />
                    Mission Board Tracker
                </h2>
                <p className="text-slate-500 mt-1">Resolve your Store Improvement Focuses before the next Wave.</p>
            </div>

            {/* Simulated Week Navigator */}
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
                <div className="xl:col-span-1 h-full w-full">
                    <AccountabilityWidget
                        slaPercentage={75}
                        streakCount={summaryData.waveHistory?.length || 0}
                        badgeStatus={summaryData.store.league}
                        isOverdue={activeWeek === 4}
                    />
                </div>

                <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 content-start">
                    {granularData?.actionPlans?.map((plan: any) => (
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
                    {(!granularData?.actionPlans || granularData.actionPlans.length === 0) && (
                        <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                            All Action Plans resolved! Good Job.
                        </div>
                    )}
                </div>
            </div>

            <ActionPlanModal
                isOpen={!!selectedPlan}
                onClose={() => setSelectedPlan(null)}
                planData={selectedPlan}
                activeWeek={activeWeek}
            />
        </div>
    );
}

export default function StorePulseDashboard() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full"></div>
                </div>
            }>
                <StoreDashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
