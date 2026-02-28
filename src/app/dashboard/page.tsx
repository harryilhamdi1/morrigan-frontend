import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { WaveSplineChart } from '@/components/store/WaveSplineChart';
import { JourneyRadarChart } from '@/components/store/JourneyRadarChart';
import { JourneyCard } from '@/components/store/JourneyCard';
import { TrendingUp, ArrowDownRight, AlertCircle, Trophy, Store, BarChart3, Activity } from 'lucide-react';

// Correct Indonesian Journey names
const JOURNEY_NAMES: Record<string, string> = {
    a: 'A. Tampilan Tampak Depan Outlet',
    b: 'B. Sambutan Hangat Ketika Masuk ke Dalam Outlet',
    c: 'C. Suasana & Kenyamanan Outlet',
    d: 'D. Penampilan Retail Assistant',
    e: 'E. Pelayanan Penjualan & Pengetahuan Produk',
    f: 'F. Pengalaman Mencoba Produk',
    g: 'G. Rekomendasi untuk Membeli Produk',
    h: 'H. Pembelian Produk & Pembayaran di Kasir',
    i: 'I. Penampilan Kasir',
    j: 'J. Toilet',
    k: 'K. Salam Perpisahan oleh Retail Assistant',
};

const JOURNEY_SHORT: Record<string, string> = {
    a: 'A. Tampak Depan', b: 'B. Sambutan', c: 'C. Suasana',
    d: 'D. Penampilan RA', e: 'E. Pelayanan & Produk', f: 'F. Cross Selling',
    g: 'G. Rekomendasi', h: 'H. Pembayaran', i: 'I. Kasir',
    j: 'J. Toilet', k: 'K. Salam Penutup',
};

export default async function NationalAnalysisPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Ambil Profil User
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, role, store_id, branch_id, region_id')
        .eq('id', user.id)
        .single();

    // Role-based redirect: Store Head & Branch Head → Store Action Plan / Branch
    if (profile?.role === 'Store Head') {
        redirect('/dashboard/store');
    }
    if (profile?.role === 'Branch Head') {
        redirect('/dashboard/branch');
    }
    if (profile?.role === 'Regional Director') {
        redirect('/dashboard/region');
    }

    // ---- NATIONAL SCOPE (HCBP / Superadmin Only) ----
    // 1. Fetch all stores (exclude Bazaar stores starting with '9')
    const { data: allStoresRaw } = await supabase
        .from('stores')
        .select('id, name, store_code, branch_id, branches(name, region_id, regions(name))');

    const allStores = (allStoresRaw || []).filter(s => !s.store_code?.startsWith('9'));
    const totalStores = allStores.length;
    const storeIds = allStores.map(s => s.id);

    // 2. Fetch all wave evaluations for these stores
    const { data: allWaves } = storeIds.length > 0
        ? await supabase.from('wave_evaluations')
            .select('store_id, wave_name, total_score, score_a, score_b, score_c, score_d, score_e, score_f, score_g, score_h, score_i, score_j, score_k, granular_failed_items')
            .in('store_id', storeIds)
            .order('wave_name', { ascending: true })
        : { data: [] };

    // 3. Determine the latest wave 
    const waveNames = [...new Set((allWaves || []).map(w => w.wave_name))].sort();
    const latestWaveName = waveNames[waveNames.length - 1] || 'N/A';
    const latestWaves = (allWaves || []).filter(w => w.wave_name === latestWaveName);

    // 4. KPIs
    const nationalIndex = latestWaves.length > 0
        ? Math.round(latestWaves.reduce((sum, w) => sum + parseFloat(String(w.total_score || 0)), 0) / latestWaves.length * 10) / 10
        : 0;

    const excellentStores = latestWaves.filter(w => parseFloat(String(w.total_score || 0)) >= 90).length;
    const redFlagStores = latestWaves.filter(w => parseFloat(String(w.total_score || 0)) < 80).length;

    // 5. Journey averages for latest wave
    const avg = (key: string) => {
        if (latestWaves.length === 0) return 0;
        const total = latestWaves.reduce((sum, w: any) => sum + parseFloat(w[key] || 0), 0);
        return Math.round((total / latestWaves.length) * 10) / 10;
    };

    const journeyScores = Object.keys(JOURNEY_NAMES).map(key => {
        const scoreVal = avg(`score_${key}`);
        // Count failed items for this section
        const failCount = latestWaves.reduce((sum, w: any) => {
            const items = w.granular_failed_items || [];
            return sum + items.filter((item: any) => item.section === key.toUpperCase()).length;
        }, 0);
        return {
            id: key,
            name: JOURNEY_NAMES[key],
            shortName: JOURNEY_SHORT[key],
            score: scoreVal,
            fails: failCount,
        };
    });

    const radarData = journeyScores.map(j => ({
        subject: j.shortName,
        A: j.score,
        fullMark: 100,
    }));

    // 6. Sort for top/bottom 3 journey priorities
    const sortedJourneys = [...journeyScores].sort((a, b) => a.score - b.score);
    const bottom3 = sortedJourneys.slice(0, 3);
    const otherScores = journeyScores.filter(j => !bottom3.find(b => b.id === j.id));

    // 7. Wave history trend (Historical Performance)
    const waveNameMap = new Map<string, any[]>();
    (allWaves || []).forEach(w => {
        if (!waveNameMap.has(w.wave_name)) waveNameMap.set(w.wave_name, []);
        waveNameMap.get(w.wave_name)!.push(w);
    });

    const waveHistory = Array.from(waveNameMap.entries()).map(([waveName, wavesArr]) => {
        const tScore = wavesArr.reduce((sum, w) => sum + parseFloat(String(w.total_score || 0)), 0) / wavesArr.length;
        return {
            name: waveName,
            storeScore: Math.round(tScore * 10) / 10,
            avgNational: Math.round(tScore * 10) / 10,
            avgBranch: Math.round(tScore * 10) / 10,
        };
    }).slice(-5);

    // 8. Regional Ranking
    const regionMap = new Map<string, { total: number, count: number }>();
    latestWaves.forEach(w => {
        const store = allStores.find(s => s.id === w.store_id);
        const regionName = (store?.branches as any)?.regions?.name || 'Unknown';
        const entry = regionMap.get(regionName) || { total: 0, count: 0 };
        entry.total += parseFloat(String(w.total_score || 0));
        entry.count += 1;
        regionMap.set(regionName, entry);
    });
    const regionRanking = Array.from(regionMap.entries())
        .map(([name, data]) => ({ name, avg: Math.round(data.total / data.count * 10) / 10, count: data.count }))
        .sort((a, b) => b.avg - a.avg);

    // 9. Top/Bottom 5 Stores
    const storeScores = latestWaves.map(w => {
        const store = allStores.find(s => s.id === w.store_id);
        return {
            name: store?.name || 'Unknown',
            score: parseFloat(String(w.total_score || 0)),
            branch: (store?.branches as any)?.name || '-',
        };
    }).sort((a, b) => b.score - a.score);

    const topStores = storeScores.slice(0, 5);
    const bottomStores = [...storeScores].sort((a, b) => a.score - b.score).slice(0, 5);

    // 10. Best performing region for KPI card
    const bestRegion = regionRanking[0]?.name || 'N/A';

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2 flex items-center gap-3">
                            <BarChart3 className="w-8 h-8 text-slate-900" />
                            National Data Analysis
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">
                            High-level performance overview • {latestWaveName} • {totalStores} Active Stores
                        </p>
                    </div>
                </div>

                {/* ===== 1. KPI HEARTBEAT CARDS ===== */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-blue-50">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ESS National Index</p>
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{nationalIndex}</h3>
                            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${nationalIndex}%` }} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-emerald-50">
                                    <Store className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Winners Circle (&gt;90)</p>
                            </div>
                            <h3 className="text-3xl font-black text-emerald-600 tracking-tight">{excellentStores}</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">out of {latestWaves.length} evaluated</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-2 border-t-rose-400 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-rose-50">
                                    <AlertCircle className="w-5 h-5 text-rose-600" />
                                </div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Red Flag Stores (&lt;80)</p>
                            </div>
                            <h3 className="text-3xl font-black text-rose-600 tracking-tight">{redFlagStores}</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Require Immediate Action</p>
                        </CardContent>
                    </Card>

                    <Card className="border-t-2 border-t-emerald-400 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2.5 rounded-xl bg-emerald-50">
                                    <Trophy className="w-5 h-5 text-emerald-600" />
                                </div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Best Region</p>
                            </div>
                            <h3 className="text-2xl font-black text-emerald-600 tracking-tight">{bestRegion}</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium">{regionRanking[0]?.avg || 0} Avg Score</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ===== 2. HISTORICAL PERFORMANCE TREND ===== */}
                <Card className="border-slate-200/60 shadow-sm border-t-2 border-t-blue-400">
                    <CardContent className="p-6">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Historical Performance Trend
                        </p>
                        <WaveSplineChart data={waveHistory} />
                    </CardContent>
                </Card>

                {/* ===== 3. JOURNEY RADAR ===== */}
                <Card className="border-slate-200/60 shadow-sm">
                    <CardContent className="p-6">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-4">Journey Radar Overview</p>
                        <JourneyRadarChart data={radarData} />
                    </CardContent>
                </Card>

                {/* ===== 4. NATIONAL TOP PRIORITIES (Bottom 3 Journeys) ===== */}
                <div className="pt-2">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">🚨 National Top Priorities (Lowest Scoring Journeys)</h3>
                        <p className="text-slate-500 mt-1">The weakest journeys dragging down the overall customer experience nationally.</p>
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
                                    failedItemsCount={j.fails}
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
                                failedItemsCount={j.fails}
                                isActionRequired={false}
                            />
                        ))}
                    </div>
                </div>

                {/* ===== 5. RANKING TABLES ===== */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    {/* Top Performing Stores */}
                    <Card className="border-slate-200/60 shadow-sm border-t-2 border-t-emerald-400 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="px-5 py-3 flex items-center gap-2 bg-slate-50/60">
                                <Trophy className="w-4 h-4 text-emerald-600" />
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Top 5 Performing Stores</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                        <th className="px-5 py-2 text-left font-bold">#</th>
                                        <th className="px-5 py-2 text-left font-bold">Store</th>
                                        <th className="px-5 py-2 text-right font-bold">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topStores.map((s, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3 font-bold text-slate-400">{i + 1}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-bold text-slate-900">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.branch}</p>
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-emerald-600">{s.score.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Bottom Performing Stores */}
                    <Card className="border-slate-200/60 shadow-sm border-t-2 border-t-rose-400 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="px-5 py-3 flex items-center gap-2 bg-slate-50/60">
                                <AlertCircle className="w-4 h-4 text-rose-600" />
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Lowest 5 Performing Stores</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                        <th className="px-5 py-2 text-left font-bold">#</th>
                                        <th className="px-5 py-2 text-left font-bold">Store</th>
                                        <th className="px-5 py-2 text-right font-bold">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bottomStores.map((s, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3 font-bold text-slate-400">{i + 1}</td>
                                            <td className="px-5 py-3">
                                                <p className="font-bold text-slate-900">{s.name}</p>
                                                <p className="text-xs text-slate-400">{s.branch}</p>
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-rose-600">{s.score.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Regional & Branch Rankings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Regional Ranking */}
                    <Card className="border-slate-200/60 shadow-sm border-t-2 border-t-blue-400 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="px-5 py-3 flex items-center gap-2 bg-slate-50/60">
                                <BarChart3 className="w-4 h-4 text-blue-600" />
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Regional Ranking</p>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase">
                                        <th className="px-5 py-2 text-left font-bold">#</th>
                                        <th className="px-5 py-2 text-left font-bold">Region</th>
                                        <th className="px-5 py-2 text-right font-bold">Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {regionRanking.map((r, i) => (
                                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-600'}`}>
                                                    {i + 1}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 font-bold text-slate-900">{r.name}</td>
                                            <td className="px-5 py-3 text-right font-black text-blue-600">{r.avg}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Action Plans Summary */}
                    <Card className="border-slate-200/60 shadow-sm border-t-2 border-t-amber-400 overflow-hidden">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ArrowDownRight className="w-4 h-4 text-amber-600" />
                                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Quick Summary AI Action Plans</p>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-sm text-slate-600">Total evaluated stores this wave: <span className="font-bold text-slate-900">{latestWaves.length}</span></p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <p className="text-sm text-slate-600">Stores above 90 (Excellent): <span className="font-bold text-emerald-700">{excellentStores}</span></p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-sm text-slate-600">Stores between 80-90 (Warning): <span className="font-bold text-amber-700">{latestWaves.length - excellentStores - redFlagStores}</span></p>
                                </div>
                                <div className="p-3 bg-rose-50 rounded-lg border border-rose-100">
                                    <p className="text-sm text-slate-600">Stores below 80 (Critical): <span className="font-bold text-rose-700">{redFlagStores}</span></p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <p className="text-sm text-slate-600">National Index: <span className="font-bold text-blue-700">{nationalIndex}</span> / 100</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </DashboardLayout>
    );
}
