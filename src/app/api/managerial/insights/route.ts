import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'branch';

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 });
    }

    try {
        // 1. Dapatkan Profil & Scope (Branch atau Region)
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('branch_id, region_id, role')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profil pengguna tidak ditemukan.' }, { status: 403 });
        }

        let storeIds: string[] = [];
        let storeNamesMap = new Map();

        // Ambil store IDs berdasarkan Scope
        if (scope === 'branch' && profile.branch_id) {
            const { data: stores } = await supabase.from('stores').select('id, name').eq('branch_id', profile.branch_id);
            if (stores) stores.forEach(s => { storeIds.push(s.id); storeNamesMap.set(s.id, s.name); });
        } else if (scope === 'region' && profile.region_id) {
            const { data: branches } = await supabase.from('branches').select('id').eq('region_id', profile.region_id);
            if (branches && branches.length > 0) {
                const bIds = branches.map(b => b.id);
                const { data: stores } = await supabase.from('stores').select('id, name').in('branch_id', bIds);
                if (stores) stores.forEach(s => { storeIds.push(s.id); storeNamesMap.set(s.id, s.name); });
            }
        } else if (['HCBP', 'Superadmin'].includes(profile.role)) {
            const { data: stores } = await supabase.from('stores').select('id, name');
            if (stores) stores.forEach(s => { storeIds.push(s.id); storeNamesMap.set(s.id, s.name); });
        }

        if (storeIds.length === 0) {
            return NextResponse.json({
                meta: { persona: scope === 'region' ? 'Executive Advisor' : 'Tactical Area Manager', analysisPeriod: 'N/A', analyzedStores: 0 },
                bottlenecks: [], praises: [], hotspots: []
            });
        }

        // 2. Kalkulasi "Hotspots" dari Real Action Plans
        const { data: plans } = await supabase
            .from('action_plans')
            .select('store_id, status, due_date, journey_name, rca_description, blocker_text')
            .in('store_id', storeIds);

        const hotspots: any[] = [];
        const bottlenecks: any[] = [];
        const praises: any[] = [];

        if (plans && plans.length > 0) {
            const now = new Date();
            const overdueByStore: Record<string, number> = {};
            const resolvedByStore: Record<string, number> = {};
            const journeyFailCount: Record<string, number> = {};
            const blockerCount: Record<string, number> = {};

            plans.forEach(p => {
                // Count overdue per store
                if (p.status === 'Requires Action' && p.due_date && new Date(p.due_date) < now) {
                    overdueByStore[p.store_id] = (overdueByStore[p.store_id] || 0) + 1;
                }

                // Count resolved per store
                if (p.status === 'Resolved') {
                    resolvedByStore[p.store_id] = (resolvedByStore[p.store_id] || 0) + 1;
                }

                // Count failed journeys across stores
                if (p.status === 'Requires Action') {
                    const jName = p.journey_name.substring(0, 30);
                    journeyFailCount[jName] = (journeyFailCount[jName] || 0) + 1;
                }

                // Count blockers
                if (p.blocker_text) {
                    const blockerKey = p.blocker_text.substring(0, 50);
                    blockerCount[blockerKey] = (blockerCount[blockerKey] || 0) + 1;
                }
            });

            // Top 3 Hotspot stores (most overdue)
            const sortedStores = Object.keys(overdueByStore)
                .sort((a, b) => overdueByStore[b] - overdueByStore[a])
                .slice(0, 3);

            sortedStores.forEach((storeId, idx) => {
                hotspots.push({
                    id: `hs-${idx + 1}`,
                    entityName: storeNamesMap.get(storeId) || 'Unknown Store',
                    metric: `${overdueByStore[storeId]} Action Plans Overdue`,
                    flagReason: 'Toko ini memiliki jumlah keterlambatan Action Plan terbanyak di wilayah Anda.'
                });
            });

            // Top bottleneck (most common failing journey across stores)
            const topJourneys = Object.entries(journeyFailCount)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 2);

            topJourneys.forEach(([journey, count], idx) => {
                bottlenecks.push({
                    id: `bn-${idx + 1}`,
                    title: `${journey} - Masalah Sistemik`,
                    description: `${count} toko di wilayah Anda masih memiliki Action Plan aktif untuk Journey ini. Ini mengindikasikan masalah yang memerlukan intervensi tingkat cabang.`,
                    severity: count > 10 ? 'High' : 'Medium',
                    affectedPercentage: Math.round((count / storeIds.length) * 100)
                });
            });

            // Top resolved store (praise)
            const topResolved = Object.entries(resolvedByStore)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 1);

            topResolved.forEach(([storeId, count]) => {
                praises.push({
                    id: 'pr-1',
                    title: `${storeNamesMap.get(storeId) || 'Unknown'} - Eksekutor Tercepat`,
                    description: `Toko ini telah menyelesaikan ${count} Action Plan. Tingkat kedisiplinan patut dijadikan contoh.`
                });
            });
        }

        // Default messages when no data patterns found
        if (hotspots.length === 0) {
            hotspots.push({
                id: 'hs-0',
                entityName: 'Seluruh Toko',
                metric: 'SLA 100%',
                flagReason: 'Tidak ada keterlambatan Action Plan yang tercatat saat ini.'
            });
        }

        return NextResponse.json({
            meta: {
                persona: scope === 'region' ? 'Executive Advisor (Gemini Pro)' : 'Tactical Area Manager (Gemini Flash)',
                analysisPeriod: 'Data Action Plan Aktif',
                analyzedStores: storeIds.length
            },
            bottlenecks,
            praises,
            hotspots
        });

    } catch (error) {
        console.error("Database Error in /api/managerial/insights:", error);
        return NextResponse.json({ error: 'Terjadi kesalahan server internal.' }, { status: 500 });
    }
}
