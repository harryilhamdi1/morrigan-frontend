import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WaveSplineChart } from '@/components/store/WaveSplineChart';
import { JourneyRadarChart } from '@/components/store/JourneyRadarChart';
import { JourneyCard } from '@/components/store/JourneyCard';
import { TrendingUp, ArrowDownRight, AlertCircle, MapPin } from 'lucide-react';

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Ambil Profil User secara komprehensif
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, role, store_id, branch_id, region_id, stores(name, league_status), branches(name), regions(name)')
        .eq('id', user.id)
        .single();

    let activeMissions = 0;
    let overdueMissions = 0;
    let storeIds: string[] = [];

    // Tentukan cakupan Toko berdasarkan Role
    if (profile?.role === 'Store Head' && profile.store_id) {
        storeIds = [profile.store_id];
    } else if (profile?.role === 'Branch Head' && profile.branch_id) {
        const { data: storesObj } = await supabase.from('stores').select('id').eq('branch_id', profile.branch_id);
        if (storesObj) storeIds = storesObj.map(s => s.id);
    } else if (profile?.role === 'Regional Director' && profile.region_id) {
        const { data: branchObj } = await supabase.from('branches').select('id').eq('region_id', profile.region_id);
        if (branchObj && branchObj.length > 0) {
            const branchIds = branchObj.map(b => b.id);
            const { data: storesObj } = await supabase.from('stores').select('id').in('branch_id', branchIds);
            if (storesObj) storeIds = storesObj.map(s => s.id);
        }
    } else if (profile?.role === 'Superadmin' || profile?.role === 'HCBP') {
        const { data: storesObj } = await supabase.from('stores').select('id');
        if (storesObj) storeIds = storesObj.map(s => s.id);
    }

    // Ambil Data Action Plans berdasarkan list Store IDs
    if (storeIds.length > 0) {
        const { data: plans } = await supabase
            .from('action_plans')
            .select('status, due_date')
            .in('store_id', storeIds);

        if (plans) {
            activeMissions = plans.filter(p => p.status === 'Requires Action' || p.status === 'Revision Required').length;
            const now = new Date();
            overdueMissions = plans.filter(p => p.status === 'Requires Action' && new Date(p.due_date) < now).length;
        }
    }

    const storeInfo = profile?.stores as any;
    const branchInfo = profile?.branches as any;
    const regionInfo = profile?.regions as any;

    let locationLabel = '';
    let leagueLabel = 'N/A';
    if (profile?.role === 'Store Head') {
        locationLabel = `Store: ${storeInfo?.name || 'Unknown'}`;
        leagueLabel = storeInfo?.league_status || 'Unranked';
    } else if (profile?.role === 'Branch Head') {
        locationLabel = `Branch: ${branchInfo?.name || 'Unknown'}`;
        leagueLabel = 'Branch Average Mode';
    } else if (profile?.role === 'Regional Director') {
        locationLabel = `Region: ${regionInfo?.name || 'Unknown'}`;
        leagueLabel = 'Regional Roll-up';
    } else {
        locationLabel = 'Headquarters (National View)';
        leagueLabel = 'National';
    }

    // Fetch Wave History dan hitung Average Scores
    let waveHistory: any[] = [];
    let radarData: any[] = [];
    let allJourneyScores: { id: string, name: string, score: number }[] = [];

    if (storeIds.length > 0) {
        // Fetch ALL waves for these stores
        const { data: allWaves } = await supabase
            .from('wave_evaluations')
            .select('*')
            .in('store_id', storeIds)
            .order('created_at', { ascending: false });

        if (allWaves && allWaves.length > 0) {
            // deduplicate taking only the latest wave per store for radar/journey data
            const latestWavesMap = new Map();
            allWaves.forEach(w => {
                if (!latestWavesMap.has(w.store_id)) {
                    latestWavesMap.set(w.store_id, w);
                }
            });
            const validWaves = Array.from(latestWavesMap.values());

            // Average score_a to score_k
            const avg = (key: string) => {
                const total = validWaves.reduce((sum: number, w: any) => sum + parseFloat(w[key] || 0), 0);
                return Math.round((total / validWaves.length) * 10) / 10;
            };

            const jA = avg('score_a');
            const jB = avg('score_b');
            const jC = avg('score_c');
            const jD = avg('score_d');
            const jE = avg('score_e');
            const jF = avg('score_f');
            const jG = avg('score_g');
            const jH = avg('score_h');
            const jI = avg('score_i');
            const jJ = avg('score_j');
            const jK = avg('score_k');

            radarData = [
                { subject: 'A. Facility', A: jA, fullMark: 100 },
                { subject: 'B. Welcome', A: jB, fullMark: 100 },
                { subject: 'C. Atmosphere', A: jC, fullMark: 100 },
                { subject: 'D. Product Knowledge', A: jD, fullMark: 100 },
                { subject: 'E. Needs Analysis', A: jE, fullMark: 100 },
                { subject: 'F. Cross Selling', A: jF, fullMark: 100 },
                { subject: 'G. Objection', A: jG, fullMark: 100 },
                { subject: 'H. Closing', A: jH, fullMark: 100 },
                { subject: 'I. Cashier', A: jI, fullMark: 100 },
                { subject: 'J. Farewell', A: jJ, fullMark: 100 },
                { subject: 'K. Grooming', A: jK, fullMark: 100 },
            ];

            allJourneyScores = [
                { id: 'a', name: 'A. Facility', score: jA },
                { id: 'b', name: 'B. Welcome', score: jB },
                { id: 'c', name: 'C. Atmosphere', score: jC },
                { id: 'd', name: 'D. Product Knowledge', score: jD },
                { id: 'e', name: 'E. Needs Analysis', score: jE },
                { id: 'f', name: 'F. Cross Selling', score: jF },
                { id: 'g', name: 'G. Objection', score: jG },
                { id: 'h', name: 'H. Closing', score: jH },
                { id: 'i', name: 'I. Cashier', score: jI },
                { id: 'j', name: 'J. Farewell', score: jJ },
                { id: 'k', name: 'K. Grooming', score: jK },
            ];

            // Wave history: group by wave_name
            const waveNameMap = new Map();
            allWaves.forEach(w => {
                if (!waveNameMap.has(w.wave_name)) waveNameMap.set(w.wave_name, []);
                waveNameMap.get(w.wave_name).push(w);
            });

            waveHistory = Array.from(waveNameMap.entries()).map(([waveName, wavesArr]) => {
                const tScore = wavesArr.reduce((sum: number, w: { total_score: string | number }) => sum + parseFloat(String(w.total_score || 0)), 0) / wavesArr.length;
                return {
                    name: waveName,
                    storeScore: Math.round(tScore * 10) / 10,
                    avgNational: Math.round(tScore * 10) / 10, // Sama dengan storeScore untuk aggregate view
                    avgBranch: Math.round(tScore * 10) / 10
                }
            }).slice(0, 5).reverse();
        }
    }

    // Sort valid scores ascending to find the bottom 3
    const validScores = allJourneyScores.filter(s => s.score > 0);
    validScores.sort((a, b) => a.score - b.score);
    const bottom3 = validScores.slice(0, 3);
    const otherScores = validScores.slice(3).sort((a, b) => b.score - a.score); // sort highest to lowest for the rest

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Welcome, {profile?.full_name || 'User'}</h1>
                        <p className="text-slate-500 font-medium">
                            {profile?.role}
                        </p>
                    </div>
                    <div className="bg-white/80 border border-slate-200 shadow-sm px-4 py-2 rounded-xl flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-slate-800">{locationLabel}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass-card isolate overflow-hidden">
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-slate-900">Active Missions</CardTitle>
                            <CardDescription>Pending action plans in your scope</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <p className="text-4xl font-black text-slate-800">{activeMissions}</p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="text-slate-900">League Status</CardTitle>
                            <CardDescription>Average Performance Category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-black text-amber-600">
                                {leagueLabel}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="text-slate-900">Overdue Alerts</CardTitle>
                            <CardDescription>Missions past deadline</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className={`text-3xl font-bold ${overdueMissions > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                                {overdueMissions > 0 ? `${overdueMissions} Overdue` : 'All Clear'}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* GRAPHICAL CHARTS AREA (Only for Store Head currently) */}
                {profile?.role === 'Store Head' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        <Card className="glass-card lg:col-span-2">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl text-slate-900">Wave-over-Wave Movement</CardTitle>
                                        <CardDescription>Historical scoring vs National Standards</CardDescription>
                                    </div>
                                    <div className="p-2 bg-slate-100/50 rounded-lg text-slate-500 border border-slate-200">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {waveHistory.length > 0 ? <WaveSplineChart data={waveHistory} /> : <p className="text-slate-500 text-sm mt-4">Offline / No Wave Data Available.</p>}
                            </CardContent>
                        </Card>

                        <Card className="glass-card">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-xl text-slate-900">Journey Matrix</CardTitle>
                                        <CardDescription>Pillar strength silhouette in your scope</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center">
                                {radarData.length > 0 ? <JourneyRadarChart data={radarData} /> : <p className="text-slate-500 text-sm mt-4">Offline Data.</p>}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="mt-8 p-6 glass-card rounded-xl border border-slate-200 text-center">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Detailed Analytics & Graphs</h3>
                        <p className="text-slate-500">Detailed graphs and visual dashboards are available in the <strong>Wave Analytics</strong> tab generated via live AI data in the next phase.</p>
                    </div>
                )}

                {/* Universal Journey Scorecards */}
                {allJourneyScores.length > 0 && (
                    <div className="mt-8 space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                                Focus Areas: Bottom 3 Execution Pillars
                            </h2>
                            <p className="text-slate-500 mt-1">The weakest journeys dragging down the overall customer experience in your scope.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {bottom3.map(j => (
                                <div key={j.id} className="transform md:scale-105 origin-center transition-all z-10 relative mt-2 mb-2">
                                    <div className="absolute -top-3 -right-3 z-20 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                                        PRIORITY
                                    </div>
                                    <JourneyCard
                                        title={j.name}
                                        score={j.score}
                                        status={j.score < 80 ? 'red' : j.score < 90 ? 'yellow' : 'green'}
                                        failedItemsCount={0}
                                        isActionRequired={j.score < 80}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-200/60 mt-8 mb-4">
                            <h3 className="text-xl font-bold text-slate-900">Other Journey Pillars</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                            {otherScores.map(j => (
                                <JourneyCard
                                    key={j.id}
                                    title={j.name}
                                    score={j.score}
                                    status={j.score < 80 ? 'red' : j.score < 90 ? 'yellow' : 'green'}
                                    failedItemsCount={0}
                                    isActionRequired={false}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
